#!/bin/bash

# Enable command printing
#set -x

# Function to run a command and check its exit status
run_command() {
    "$@"
    local status=$?
    if [ $status -ne 0 ]; then
        echo "Error: Command '$*' failed with exit status $status"
        exit 1
    fi
    return $status
}

# Check if the correct number of arguments are provided
if [ $# -ne 2 ]; then
  echo "Usage: $0 <zip-file-path> <output-directory>"
  exit 1
fi

ZIP_FILE="$1"
OUTPUT_DIR="$2"

# Check if ZIP_FILE exists
if [ ! -f "$ZIP_FILE" ]; then
    echo "Error: ZIP file $ZIP_FILE does not exist"
    exit 1
fi

BASE_NAME=$(basename "$ZIP_FILE" .zip)
echo "Removing directory: $OUTPUT_DIR/$BASE_NAME"
run_command rm -rf "$OUTPUT_DIR/$BASE_NAME"
run_command rm -rf "$OUTPUT_DIR/__MACOSX"

# Create the output directory if it doesn't exist
run_command mkdir -p "$OUTPUT_DIR"

# Check if bsdtar is installed, if not, install it
if ! command -v bsdtar &> /dev/null; then
    echo "bsdtar not found. Installing libarchive-tools..."
    run_command apt-get update
    run_command apt-get install -y libarchive-tools
fi

# Extract the zip file using bsdtar with verbose output
echo "Extracting $ZIP_FILE to $OUTPUT_DIR"
run_command bsdtar --no-xattrs -xf "$ZIP_FILE" -C "$OUTPUT_DIR"

echo "Extraction completed"

# Print the contents of the output directory for verification
#echo "Contents of $OUTPUT_DIR:"
#run_command ls -R "$OUTPUT_DIR"

# Disable command printing
set +x