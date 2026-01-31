import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import API from "../../api/api";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AdminLostFoundScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  
  // State
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("LOST"); // "LOST" | "FOUND"
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [reportType, setReportType] = useState("LOST");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const url = activeTab === "MINE" ? "/lostfound" : `/lostfound?type=${activeTab}`;
      const res = await API.get(url);
      let data = res.data.items || res.data || [];
      
      if (activeTab === "MINE") {
        data = data.filter(item => item.userId === user.id);
      }
      
      setItems(data);
    } catch (err) {
      console.log("Error fetching lost/found items:", err.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, user.id]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const handleReport = async () => {
    if (!title || !description || !location) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }
    
    try {
      setSubmitting(true);
      await API.post("/lostfound/report", {
        type: reportType,
        title,
        description,
        location
      });
      setModalVisible(false);
      setTitle("");
      setDescription("");
      setLocation("");
      fetchItems();
      Alert.alert("Success", "Report submitted successfully! 📝");
    } catch (err) {
      console.log("Report Error:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.message || "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (id) => {
    Alert.alert("Delete record", "Are you sure you want to delete this record?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => onDelete(id) },
    ]);
  };

  const onDelete = async (id) => {
    try {
      setLoading(true);
      await API.delete(`/lostfound/${id}`);
      await fetchItems();
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to delete record");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const isMine = item.userId === user.id;
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.badgeContainer}>
            <View style={[styles.typeBadge, item.type === "FOUND" ? styles.badgeGreen : styles.badgeLost]}>
              <Text style={styles.badgeText}>{item.type}</Text>
            </View>
            {item.resolved && (
              <View style={styles.resolvedBadge}>
                <Text style={styles.resolvedText}>Resolved</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc}>{item.description}</Text>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.meta}>{item.location}</Text>
          {item.user?.name && (
            <>
              <Text style={styles.metaSep}>•</Text>
              <Text style={styles.meta}>By {item.user.name}</Text>
            </>
          )}
        </View>

        <View style={styles.actionsRow}>
          {isMine && (
            <TouchableOpacity 
              style={[styles.actionBtn, styles.dangerBtn]} 
              onPress={() => confirmDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Delete</Text>
            </TouchableOpacity>
          )}
          {!isMine && (
            <TouchableOpacity 
              style={[styles.actionBtn, styles.dangerBtn]} 
              onPress={() => confirmDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Hero Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lost & Found</Text>
        </View>
        <Text style={styles.headerSubtitle}>Report lost/found items and manage them 🔍</Text>
        
        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            placeholder="Search reports"
            value={title}
            onChangeText={setTitle}
            style={styles.searchInput}
            placeholderTextColor="#777"
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {["LOST", "FOUND"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === "LOST" ? "Lost" : "Found"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>No items found</Text> : null
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setReportType(activeTab);
          setModalVisible(true);
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Report Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#111" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Report Lost/Found</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeSelector}>
                {["LOST", "FOUND"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeBtn, reportType === type && styles.typeBtnActive]}
                    onPress={() => setReportType(type)}
                  >
                    <Text style={[styles.typeBtnText, reportType === type && styles.typeBtnTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Title</Text>
              <TextInput
                placeholder="What was lost/found?"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                placeholder="Describe in detail..."
                value={description}
                onChangeText={setDescription}
                style={[styles.input, { height: 100, textAlignVertical: "top" }]}
                multiline
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Location</Text>
              <TextInput
                placeholder="Where did you find/lose it?"
                value={location}
                onChangeText={setLocation}
                style={styles.input}
                placeholderTextColor="#999"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.submitBtn]}
                onPress={handleReport}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f0e7",
  },
  header: {
    backgroundColor: "#e9d7ff",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#555",
    marginBottom: 12,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 18,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#111",
    fontSize: 15,
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 0,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#111",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#999",
  },
  tabTextActive: {
    color: "#111",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 10,
  },
  badgeContainer: {
    flexDirection: "row",
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeLost: {
    backgroundColor: "#dbeafe",
  },
  badgeGreen: {
    backgroundColor: "#dcfce7",
  },
  badgeText: {
    fontWeight: "800",
    color: "#111",
    fontSize: 12,
  },
  resolvedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
  },
  resolvedText: {
    fontWeight: "700",
    color: "#111",
    fontSize: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  meta: {
    fontSize: 13,
    color: "#666",
  },
  metaSep: {
    color: "#bbb",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  dangerBtn: {
    backgroundColor: "#b91c1c",
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    paddingVertical: 40,
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    marginTop: 16,
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: "row",
    gap: 10,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  typeBtnActive: {
    backgroundColor: "#111",
  },
  typeBtnText: {
    fontWeight: "700",
    color: "#666",
  },
  typeBtnTextActive: {
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111",
    backgroundColor: "#f9f9f9",
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#f3f4f6",
  },
  cancelBtnText: {
    fontWeight: "700",
    color: "#111",
  },
  submitBtn: {
    backgroundColor: "#111",
  },
  submitBtnText: {
    fontWeight: "700",
    color: "#fff",
  },
});

export default AdminLostFoundScreen;
