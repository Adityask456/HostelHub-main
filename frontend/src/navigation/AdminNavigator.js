import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

// Student Screens (Request functionality)
import ApplyLeaveScreen from "../screens/Student/ApplyLeaveScreen";
import MyLeavesScreen from "../screens/Student/MyLeavesScreen";
import ComplaintsScreen from "../screens/Student/ComplaintsScreen";
import PollsScreen from "../screens/Student/PollsScreen";
import MessMenuScreen from "../screens/Student/MessMenuScreen";
import MarketplaceScreen from "../screens/Student/MarketplaceScreen";
import LostFoundScreen from "../screens/Student/LostFoundScreen";

// Warden Screens (Management functionality)
import ManageComplaintsScreen from "../screens/Warden/ManageComplaintsScreen";
import MessMenuManageScreen from "../screens/Warden/MessMenuManageScreen";
import PollsManageScreen from "../screens/Warden/PollsManageScreen";
import WardenMarketplaceScreen from "../screens/Warden/WardenMarketplaceScreen";
import WardenLostFoundScreen from "../screens/Warden/WardenLostFoundScreen";
import PendingLeavesScreen from "../screens/Warden/PendingLeavesScreen";
import WardenNotificationsScreen from "../screens/Warden/WardenNotificationsScreen";

// Admin-specific
import WardenProfileScreen from "../screens/Warden/WardenProfileScreen";
import AdminHomeScreen from "../screens/Admin/AdminHomeScreen";
import AdminLostFoundScreen from "../screens/Admin/AdminLostFoundScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
      {/* Student Request Screens */}
      <Stack.Screen name="ApplyLeave" component={ApplyLeaveScreen} />
      <Stack.Screen name="MyLeaves" component={MyLeavesScreen} />
      <Stack.Screen name="CreateComplaint" component={ComplaintsScreen} />
      <Stack.Screen name="StudentPolls" component={PollsScreen} />
      <Stack.Screen name="StudentMess" component={MessMenuScreen} />
      <Stack.Screen name="StudentMarketplace" component={MarketplaceScreen} />
      <Stack.Screen name="StudentLostFound" component={AdminLostFoundScreen} />
      {/* Warden Management Screens */}
      <Stack.Screen name="ManageComplaints" component={ManageComplaintsScreen} />
      <Stack.Screen name="ManageMess" component={MessMenuManageScreen} />
      <Stack.Screen name="ManagePolls" component={PollsManageScreen} />
      <Stack.Screen name="ManageMarketplace" component={WardenMarketplaceScreen} />
      <Stack.Screen name="ManageLostFound" component={WardenLostFoundScreen} />
      <Stack.Screen name="PendingLeaves" component={PendingLeavesScreen} />
      <Stack.Screen name="Notifications" component={WardenNotificationsScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 24,
    height: 60,
    borderRadius: 25,
    backgroundColor: "#ffffff",
    borderTopWidth: 0,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    width: "80%",
    alignSelf: "center",
    marginHorizontal: "10%",
    paddingBottom: 0,
    paddingTop: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  activeIcon: {
    backgroundColor: "#cfe8ff", // Admin-specific blue color
    shadowColor: "#cfe8ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        name="Home"
        component={AdminStack}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? "AdminHome";
          const hide = routeName !== "AdminHome";
          return {
            tabBarIcon: ({ focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIcon]}>
                <Ionicons name={focused ? "home" : "home-outline"} size={24} color={focused ? "#111" : "#aaa"} />
              </View>
            ),
            tabBarStyle: [styles.tabBar, hide ? { display: "none" } : null],
          };
        }}
      />
      <Tab.Screen
        name="Profile"
        component={WardenProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIcon]}>
              <Ionicons name={focused ? "person" : "person-outline"} size={24} color={focused ? "#111" : "#aaa"} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
