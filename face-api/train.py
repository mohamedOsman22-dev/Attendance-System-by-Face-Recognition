import os
import pickle
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from PIL import Image
from torchvision import transforms
from efficientnet_pytorch import EfficientNet
import torch

# المسارات
DATASET_DIR = "dataset"
OUTPUT_PATH = "classifier.pkl"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
effnet = EfficientNet.from_pretrained('efficientnet-b2')
effnet._fc = torch.nn.Identity()
effnet = effnet.to(device).eval()

transform = transforms.Compose([
    transforms.Resize((260, 260)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

embeddings = []
labels = []

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

print(f"✅ Processed {len(embeddings)} images.")

X = np.array(embeddings)
y = np.array(labels)

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

model = KNeighborsClassifier(n_neighbors=1)
model.fit(X_scaled, y)

with open(OUTPUT_PATH, 'wb') as f:
    pickle.dump({
        'model': model,
        'scaler': scaler,
        'embeddings': X,
        'labels': y
    }, f)

print(f"✅ Classifier saved to {OUTPUT_PATH}")