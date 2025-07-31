# face_api.py (كامل وجاهز للاستخدام)

import os
import pickle
import numpy as np
import shutil
import zipfile
from tempfile import TemporaryDirectory
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from PIL import Image
from io import BytesIO
from torchvision import transforms
from efficientnet_pytorch import EfficientNet
import torch
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

DATASET_DIR = "dataset"
MODEL_PATH = "classifier.pkl"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
effnet = EfficientNet.from_pretrained('efficientnet-b2')
effnet._fc = torch.nn.Identity()
effnet = effnet.to(device).eval()

transform = transforms.Compose([
    transforms.Resize((260, 260)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

threshold = 0.8

model, scaler, embeddings, labels = None, None, None, None

def load_model():
    global model, scaler, embeddings, labels
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, 'rb') as f:
            data = pickle.load(f)
            model = data['model']
            scaler = data['scaler']
            embeddings = data['embeddings']
            labels = data['labels']
        print("✅ Model loaded")
    else:
        print("❌ No model file found")

load_model()

@app.post("/classify")
async def classify(image: UploadFile = File(...)):
    try:
        img = Image.open(BytesIO(await image.read())).convert("RGB")
        tensor = transform(img).unsqueeze(0).to(device)
        with torch.no_grad():
            emb = effnet(tensor)
            emb = torch.nn.functional.normalize(emb, p=2, dim=1).squeeze().cpu().numpy()

        if scaler is None or model is None:
            return JSONResponse(status_code=500, content={"error": "Model not loaded"})

        scaled = scaler.transform([emb])
        pred = model.predict(scaled)[0]

        similarities = cosine_similarity([emb], embeddings)
        max_similarity = max(similarities[0])

        if max_similarity < threshold:
            return {"uuid": "Unknown"}

        return {"uuid": pred}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/embed")
async def embed(image: UploadFile = File(...)):
    try:
        img = Image.open(BytesIO(await image.read())).convert("RGB")
        tensor = transform(img).unsqueeze(0).to(device)
        with torch.no_grad():
            emb = effnet(tensor)
            emb = torch.nn.functional.normalize(emb, p=2, dim=1).squeeze().cpu().numpy()
        return emb.tolist()
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/upload_classifier")
async def upload_classifier(model_file: UploadFile = File(...)):
    try:
        contents = await model_file.read()
        with open(MODEL_PATH, 'wb') as f:
            f.write(contents)
        load_model()
        return {"message": "Classifier uploaded and loaded."}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

def train_classifier():
    global model, scaler, embeddings, labels
    embeddings, labels = [], []
    for person in os.listdir(DATASET_DIR):
        person_path = os.path.join(DATASET_DIR, person)
        if not os.path.isdir(person_path):
            continue
        for img_name in os.listdir(person_path):
            img_path = os.path.join(person_path, img_name)
            try:
                img = Image.open(img_path).convert("RGB")
                tensor = transform(img).unsqueeze(0).to(device)
                with torch.no_grad():
                    emb = effnet(tensor)
                    emb = torch.nn.functional.normalize(emb, p=2, dim=1).squeeze().cpu().numpy()
                embeddings.append(emb)
                labels.append(person)
            except Exception as e:
                print(f"⚠️ Error processing {img_path}: {e}")

    if not embeddings:
        raise Exception("No images found for training.")

    X = np.array(embeddings)
    y = np.array(labels)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = KNeighborsClassifier(n_neighbors=1)
    model.fit(X_scaled, y)

    with open(MODEL_PATH, 'wb') as f:
        pickle.dump({
            'model': model,
            'scaler': scaler,
            'embeddings': X,
            'labels': y
        }, f)
    print("✅ Classifier retrained and saved.")

@app.post("/upload_training_images")
async def upload_training_images(file: UploadFile = File(...)):
    try:
        with TemporaryDirectory() as temp_dir:
            zip_path = os.path.join(temp_dir, file.filename)
            with open(zip_path, "wb") as buffer:
                buffer.write(await file.read())

            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)

            number_path = os.path.join(temp_dir, "student_number.txt")
            with open(number_path, "r") as f:
                student_number = f.read().strip()

            student_folder = os.path.join(DATASET_DIR, student_number)
            os.makedirs(student_folder, exist_ok=True)

            for file_name in os.listdir(temp_dir):
                src_file_path = os.path.join(temp_dir, file_name)
                if file_name not in ["student_number.txt", file.filename] and not file_name.endswith(".zip"):
                    dst = os.path.join(student_folder, file_name)
                    shutil.move(src_file_path, dst)

            # مسح الموديل القديم وإعادة التدريب
            if os.path.exists(MODEL_PATH):
                os.remove(MODEL_PATH)
                print("✅ Old classifier deleted.")

            train_classifier()

            return {
                "message": "Images uploaded and model retrained successfully",
                "student_number": student_number,
                "num_images": len(os.listdir(student_folder))
            }

    except Exception as e:
        return {"error": str(e)}