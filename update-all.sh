#!/bin/bash

check_and_commit() {
  folder=$1
  prefix=$2
  branch=$3

  echo "Checking for changes in $folder/..."

  if [ -n "$(git status --porcelain $folder)" ]; then
    echo "⚠️  Detected uncommitted changes in $folder/"
    git add $folder
    echo "✅ Staged changes in $folder/"
    echo "Please enter your commit message for changes in $folder/:"
    read commit_message
    git commit -m "$commit_message"
  fi

  echo "Pulling updates for $folder/"
  git subtree pull --prefix=$folder ${folder}-origin $branch --squash
}

echo "Fetching all remotes..."
git fetch frontend-origin
git fetch backend-origin
git fetch face-api-origin

# Check, commit if needed, then pull for each
check_and_commit frontend frontend-origin master
check_and_commit backend backend-origin master
check_and_commit face-api face-api-origin main

echo "Pushing everything to origin..."
git push

echo "✅ All folders updated and pushed!"
