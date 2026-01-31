import React, { useContext } from "react";
import { View, Text, StyleSheet, ScrollView, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import Tile from "../../components/Tile";

export default function AdminHomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const tilesData = [
    {
      id: '1',
      color: "#58bfff",
      label: "Polls",
      icon: "arrow-forward",
      onPress: () => navigation.navigate("ManagePolls"),
      image: require("../../../assets/polls.png"),
      imageStyle: "tileImagePolls"
    },
    {
      id: '2',
      color: "#f5cf6a",
      label: "Mess",
      icon: "arrow-forward",
      onPress: () => navigation.navigate("StudentMess"),
      image: require("../../../assets/mess.png"),
      imageStyle: "tileImageMess"
    },
    {
      id: '3',
      color: "#b9e1d0",
      label: "Complaints",
      icon: "arrow-forward",
      onPress: () => navigation.navigate("CreateComplaint"),
      image: require("../../../assets/complaints.png"),
      imageStyle: "complaints"
    },
    
    {
      id: '4',
      color: "#e6d0c6",
      label: "My Leaves",
      icon: "arrow-forward",
      onPress: () => navigation.navigate("MyLeaves"),
      image: require("../../../assets/leaves.png"),
      imageStyle: "tileImageLeave"
    },
    {
      id: '5',
      color: "#ffd6a5",
      label: "Marketplace",
      icon: "arrow-forward",
      onPress: () => navigation.navigate("StudentMarketplace"),
      image: require("../../../assets/marketplace.png"),
      imageStyle: "marketplace"
    },
    {
      id: '6',
      color: "#e9d7ff",
      label: "Lost & Found",
      icon: "arrow-forward",
      onPress: () => navigation.navigate("StudentLostFound"),
      image: require("../../../assets/lostfound.png"),
      imageStyle: "lostfound"
    },
    {
      id: '7',
      color: "#cde6ff",
      label: "Manage Complaints",
      icon: "arrow-forward",
      onPress: () => navigation.navigate("ManageComplaints"),
      image: require("../../../assets/complaints.png"),
      imageStyle: "complaints"
    },
    {
      id: '8',
      color: "#d1f7c4",
      label: "Manage Mess",
      icon: "arrow-forward",
      onPress: () => navigation.navigate("ManageMess"),
      image: require("../../../assets/mess.png"),
      imageStyle: "tileImageMess"
    }
  ];

  const renderTile = ({ item }) => (
    <Tile
      color={item.color}
      label={item.label}
      icon={item.icon}
      onPress={item.onPress}
      image={item.image}
      imageStyle={styles[item.imageStyle]}
    />
  );
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Admin Dashboard</Text>
          <Text style={styles.heroTitle}>
            Hello, {user?.name?.split(" ")[0] || "Admin"}{"\n"}
            Ready to <Text style={styles.heroTitleBold}>manage and request?</Text>
          </Text>
          <View style={styles.heroInput}>
            <Text style={styles.heroInputText}>Complaints, marketplace, mess...</Text>
          </View>
        </View>
        <Text style={styles.title}>Quick actions</Text>

        <FlatList
          data={tilesData}
          renderItem={renderTile}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.grid}
          contentContainerStyle={styles.gridContainer}
          scrollEnabled={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f0e7ff" },
  
  content:{
    padding: 20, 
    paddingBottom: 120,
  },
  hero: {
    backgroundColor: "#cfe8ff",
    marginHorizontal: 4,
    marginBottom: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 26,
    borderBottomLeftRadius: 46,
    borderBottomRightRadius: 6,
  },
  heroTopRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  heroLogo: { width: 18, height: 18, borderRadius: 6, backgroundColor: "#111" },
  heroSettings: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(17,17,17,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  kicker: { color: "#111", opacity: 0.6, marginBottom: 2 },
  heroTitle: { fontSize: 26, fontWeight: "800", color: "#111", lineHeight: 32, marginBottom: 10 },
  heroTitleBold: { fontWeight: "900" },
  heroInput: {
    marginTop: 4,
    backgroundColor: "rgba(17,17,17,0.06)",
    borderRadius: 18,
    height: 44,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroInputText: { color: "#6b6b6b" },
  welcomeText: {
    fontSize: 24, 
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },

  title: { 
    fontSize: 28, 
    fontWeight: "800", 
    color: "#111", 
    marginBottom: 16 
  },
  grid: { 
    justifyContent: "space-between"
  },
  gridContainer: {
    paddingBottom: 20
  },
  tileImagePolls: {
    position: "absolute",
    top: 20,
    width: 160,
    height: 160,
    opacity: 0.9,
  },
  tileImageMess: {
    left:15,
    top:22,
    width: 140,
    height: 150,
    opacity: 1,
  },
  complaints: {
    position: "absolute",
    top:20,
    left: 14,
    width: 165,
    height: 165,
    opacity: 0.95,
  },
  marketplace: {
    position: "absolute",
    top: 27,
    left: 10,
    width: 160,
    height: 160,
    opacity: 0.95,
  },
  lostfound: {
    top: 14,
    width: 165,
    height: 165,
    opacity: 0.95,
  },
});
