import { Image, StyleSheet, Text, View, type ColorValue, type ImageSourcePropType } from 'react-native';
import type { Anchor } from '@maplayr/react-native';

const ICON_SIZE = 26;

// Puts the centre of the icon, not of the whole annotation, on the coordinates.
export const LABELED_ANNOTATION_ICON_ANCHOR: Anchor = { x: '50%', y: ICON_SIZE / 2 };

// An icon with its label below it.
export function LabeledAnnotationIcon({ icon, label, labelColor = 'black' }: {
  icon: ImageSourcePropType,
  label?: string,
  labelColor?: ColorValue,
}) {
  return (
    <View style={styles.annotation}>
      <Image source={icon} style={styles.icon} />
      {label && (
        <Text style={[styles.label, { color: labelColor }]}>
          {label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  annotation: {
    alignItems: 'center',
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  label: {
    maxWidth: 250,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
