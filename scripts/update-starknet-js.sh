#!/bin/bash

# Install jq if it's not installed:
if ! command -v jq &>/dev/null; then
    echo "jq could not be found, installing..."
    # Install depending on if we're on a mac or linux:
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install jq
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get install jq
    else
        echo "Could not install jq, please install it manually."
        exit 1
    fi
fi

# scan packages folder for package.json files, non-recursively:
for file in packages/*/package.json; do
    # get the package name from the package.json file:
    package=$(jq -r .name $file)
    # get the package version from the package.json file:
    version=$(jq -r .version $file)
    # print the package name and version:
    echo "$package@$version"

    # look for starknet in the dependencies, devDependencies and peerDependencies:
    if jq -e '.dependencies.starknet' $file >/dev/null; then
        # update the starknet dependency:
        yarn --cwd packages/$(basename $(dirname $file)) add starknet@next
    fi
    if jq -e '.devDependencies.starknet' $file >/dev/null; then
        # update the starknet devDependency:
        yarn --cwd packages/$(basename $(dirname $file)) add -D starknet@next
    fi
    if jq -e '.peerDependencies.starknet' $file >/dev/null; then
        # update the starknet peerDependency:
        yarn --cwd packages/$(basename $(dirname $file)) add -P starknet@next
    fi
done
