/**
 * AppNavigator Component
 * Configures the native stack navigation flow:
 * Login -> BranchSelection -> SupervisorSelection -> DailyTransaction <-> BroilerRecords -> BroilerRecordDetail
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSession } from '../context/SessionContext';

import LoginScreen from '../screens/LoginScreen';
import BranchSelectionScreen from '../screens/BranchSelectionScreen';
import SupervisorSelectionScreen from '../screens/SupervisorSelectionScreen';
import DailyTransactionScreen from '../screens/DailyTransactionScreen';
import BroilerRecordsScreen from '../screens/BroilerRecordsScreen';
import BroilerRecordDetailScreen from '../screens/BroilerRecordDetailScreen';
import { LoadingView } from '../components/StateViews';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { currentUser, isInitializing } = useSession();

  if (isInitializing) {
    return <LoadingView message="Initializing SPBF Portal..." />;
  }

  return (
    <Stack.Navigator
      initialRouteName={currentUser ? 'BranchSelection' : 'Login'}
      screenOptions={{
        headerShown: false, // We use custom styled AppBar matching the SPBF website
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="BranchSelection" component={BranchSelectionScreen} />
      <Stack.Screen name="SupervisorSelection" component={SupervisorSelectionScreen} />
      <Stack.Screen name="DailyTransaction" component={DailyTransactionScreen} />
      <Stack.Screen name="BroilerRecords" component={BroilerRecordsScreen} />
      <Stack.Screen name="BroilerRecordDetail" component={BroilerRecordDetailScreen} />
    </Stack.Navigator>
  );
}
