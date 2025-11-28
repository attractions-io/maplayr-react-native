import Foundation
import MapLayr

@objc
public class MapDataWrapper : NSObject {
    
    let mapData: MapData
    
    public init(mapData: MapData) {
        self.mapData = mapData
    }
    
    @objc
    public func getVersion() -> String {
        return "\(String(describing: mapData.version))"
    }
}
