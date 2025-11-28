import MapGeometry

public final class LabeledAnnotationIconInstance {
	var id: Int
	
	struct Data: Decodable {
		var title: String?
		var iconAsset: String?
		var coordinates: Coordinates
		var labelTextColor: UInt32
		var labelStrokeColor: UInt32
	}
	
	var data: Data
	
	init(id: Int, data: Data) {
		self.id = id
		self.data = data
	}
}

extension LabeledAnnotationIconInstance: Hashable {
	public static func == (lhs: LabeledAnnotationIconInstance, rhs: LabeledAnnotationIconInstance) -> Bool {
		lhs.id == rhs.id
	}
	
	public func hash(into hasher: inout Hasher) {
		hasher.combine(id)
	}
}
