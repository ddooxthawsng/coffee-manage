import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import OrderScreen from './screens/OrderScreen';
import InvoiceListScreen from './screens/InvoiceListScreen';
import InvoiceDetailScreen from './screens/InvoiceDetailScreen';
import LoginScreen from './screens/LoginScreen';

// Icons
import { FontAwesome, Ionicons } from '@expo/vector-icons';

// Auth and state management
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Tab navigator for authenticated users
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Order') {
            return <FontAwesome name="shopping-cart" size={size} color={color} />;
          } else if (route.name === 'Invoices') {
            return <FontAwesome name="file-text-o" size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: '#1890ff',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#ffffff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#f0f0f0',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#1890ff',
        },
      })}
    >
      <Tab.Screen 
        name="Order" 
        component={OrderScreen} 
        options={{ title: 'Bán hàng' }}
      />
      <Tab.Screen 
        name="Invoices" 
        component={InvoiceListScreen} 
        options={{ title: 'Hóa đơn' }}
      />
    </Tab.Navigator>
  );
};

// Main component that handles authentication flow
const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen 
              name="InvoiceDetail" 
              component={InvoiceDetailScreen} 
              options={({ route }) => ({ 
                headerShown: true,
                title: `Hóa đơn #${route.params?.id || ''}`,
                headerBackTitle: 'Quay lại'
              })}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Root component with providers
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
