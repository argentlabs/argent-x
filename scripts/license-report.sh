# declare blacklist
BLACKLIST=(
    "storybook"
)

# install license-report if not already installed
if ! command -v license-report &> /dev/null
then
    echo "license-report could not be found, installing..."
    npm install -g license-report
fi

# create license-report.md
echo "Generating license report..."
echo "# License Report" > license-report.md
echo "" >> license-report.md
echo "This report was generated on $(date)" >> license-report.md
echo "" >> license-report.md

# loop over all packages
for package in $(ls packages); do
    # check if package is in a blacklist
    if [[ " ${BLACKLIST[@]} " =~ " ${package} " ]]; then
        echo "Skipping $package..."
        continue
    fi
    echo "Generating license report for $package..."
    echo "## @argent/$package" >> license-report.md
    echo "" >> license-report.md
    license-report --package=./packages/$package/package.json --only=prod --config=license-report-config.json >> license-report.md
    echo "" >> license-report.md
done

# format license-report.md
echo "Formatting license report..."
pnpm prettier --write license-report.md