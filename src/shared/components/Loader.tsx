import { ActivityIndicator, StyleSheet, View } from "react-native";

type LoaderProps = {
  color?: string;
  backgroundColor?: string;
};

export default function Loader({
  color = "#0F172A",
  backgroundColor = "transparent",
}: LoaderProps) {
  return (
    <View
      style={[styles.container, { backgroundColor }]}
    >
      <ActivityIndicator size="large" color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "stretch",
    width: "100%",
  },
});
