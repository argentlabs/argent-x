#!/bin/bash

# Enable command printing
#set -x

# Function to run a command and check its exit status
run_command() {
    output=$("$@")
    local status=$?
    if [ $status -ne 0 ]; then
        echo "Error: Command '$*' failed with exit status $status" >&2
        exit 1
    fi
    echo "$output"
}

# Extract the version
VERSION=$(run_command grep -m1 '"version":' ../extension/dist/manifest.json | awk -F: '{ print $2 }' | sed 's/[", ]//g')

# Print the version
echo "$VERSION"

# Return the version as the script's output
exit 0