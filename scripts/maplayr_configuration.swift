import Foundation

// Search for attractions.io.config.json in the root directory of the React Native project
let podsRoot: String = ProcessInfo.processInfo.environment["PODS_ROOT"]!
let configFilePath: String = "\(podsRoot)/../../attractions.io.config.json"

if !FileManager.default.fileExists(atPath: configFilePath) {
    print("error: Unable to find configuration file `attractions.io.config.json` in the root directory of the React Native project")
    exit(1)
}

do {
    // Parse the attractions.io.config.json file
    let jsonData = try Data(contentsOf: URL(fileURLWithPath: configFilePath))
    let decoder = JSONDecoder()
    let config = try decoder.decode(Config.self, from: jsonData)

    // Write the API key into the Info.plist file
    let targetBuildDir = ProcessInfo.processInfo.environment["TARGET_BUILD_DIR"]!
    let infoPListPath = ProcessInfo.processInfo.environment["INFOPLIST_PATH"]!
    let infoPList = "\(targetBuildDir)/\(infoPListPath)"

    try runTerminalProcess(
        executableURL: "/usr/libexec/PlistBuddy",
        arguments: ["-c", "Add :Attractions.io dict", infoPList]
    )
    
    try runTerminalProcess(
        executableURL: "/usr/libexec/PlistBuddy", 
        arguments: ["-c", "Add :Attractions.io:APIKey string \(config.apiKey)", infoPList]
    )
    // Download any specified maps
    if let maps = config.mapLayr?.maps {
        let buildRoot = ProcessInfo.processInfo.environment["BUILD_ROOT"]!
        let downloadMapBinary = "\(buildRoot)/../../SourcePackages/checkouts/maplayr-ios/download-map"

        if !FileManager.default.fileExists(atPath: downloadMapBinary) {
            print("error: download-map script not found")
            exit(1)
        }

        let builtProductsDir = ProcessInfo.processInfo.environment["BUILT_PRODUCTS_DIR"]!
        let fullProductName = ProcessInfo.processInfo.environment["FULL_PRODUCT_NAME"]!

        let mapsDestinationDirectory = "\(builtProductsDir)/\(fullProductName)/MapLayr"

        if !FileManager.default.fileExists(atPath: mapsDestinationDirectory) {
            try FileManager.default.createDirectory(atPath: mapsDestinationDirectory, withIntermediateDirectories: true)
        }

        for (_, mapId) in maps {
            try runTerminalProcess(
                executableURL: downloadMapBinary,
                arguments: [
                    "-k", config.apiKey,
                    "-m", mapId,
                    "-d", mapsDestinationDirectory,
                    "--skip-if-exists"
                ]
            )
        }
    }
} catch let decodingError as DecodingError {
    print("error: An error occurred decoding attractions.io.config.json. Is the file in the correct format? \(decodingError)")
    exit(1)
}
catch {
    print("error: An unexpected error occurred \(error)")
    exit(1)
}

private func runTerminalProcess(executableURL: String, arguments: [String]) throws {
    let process = Process()
    let errorPipe = Pipe()
    let outputPipe = Pipe()
    process.executableURL = URL(fileURLWithPath: executableURL)
    process.arguments = arguments
    process.standardError = errorPipe
    process.standardOutput = outputPipe

    try process.run()
    process.waitUntilExit()

    if process.terminationStatus != 0 {
        let errorData = errorPipe.fileHandleForReading.readDataToEndOfFile()
        if let errorOutput = String(data: errorData, encoding: .utf8), !errorOutput.isEmpty {
            print("error: \(errorOutput)")
        }
        exit(1)
    }
}

struct Config : Codable {
    let apiKey: String
    let mapLayr: MapLayrConfig?
}

struct MapLayrConfig: Codable {
    let maps: [String: String]
}
