# React Native MapLayr SDK

## iOS Notes

### Podfile

The user must add `use_frameworks!` to their Podfile since we are using Swift Package Manager to pull in the MapLayr dependency.

## Config Notes

Add attractions.io.config.json to the `.gitignore` file.

In iOS the build phase is the following

```
xcrun --sdk macosx swift "${PODS_ROOT}/../../node_modules/react-native-maplayr/scripts/maplayr_configuration.swift"
```

For the example app however it needs to be

```
xcrun --sdk macosx swift "${PODS_ROOT}/../../../scripts/maplayr_configuration.swift"