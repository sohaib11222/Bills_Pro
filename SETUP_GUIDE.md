# BillsPro API Integration Setup Guide

## ✅ Completed Setup

### 1. API Configuration
- ✅ Created `api.config.js` with all 86 API routes
- ✅ Base URL configured: `https://billspro.hmstech.xyz/api`

### 2. API Client
- ✅ Created `services/api/apiClient.ts` with axios instance
- ✅ Request interceptor for auth tokens
- ✅ Response interceptor for error handling
- ✅ Auto-logout on 401 errors

### 3. Storage Utilities
- ✅ Created `services/storage/authStorage.ts`
- ✅ Token storage with AsyncStorage
- ✅ User data storage
- ✅ PIN status storage

### 4. TanStack Query Setup
- ✅ Created `services/QueryClient.tsx`
- ✅ Configured QueryClient provider in `App.tsx`
- ✅ Default query/mutation options set

### 5. Queries (GET Routes)
All queries created in `queries/` folder:
- ✅ `authQueries.ts` - Authentication queries
- ✅ `dashboardQueries.ts` - Dashboard data
- ✅ `walletQueries.ts` - Wallet balances
- ✅ `depositQueries.ts` - Deposit operations
- ✅ `withdrawalQueries.ts` - Withdrawal operations
- ✅ `transactionQueries.ts` - Transaction history
- ✅ `kycQueries.ts` - KYC information
- ✅ `billPaymentQueries.ts` - Bill payment data
- ✅ `cryptoQueries.ts` - Crypto operations
- ✅ `virtualCardQueries.ts` - Virtual card data
- ✅ `supportQueries.ts` - Support tickets
- ✅ `chatQueries.ts` - Chat sessions
- ✅ `userQueries.ts` - User profile

### 6. Mutations (POST/PUT/DELETE Routes)
All mutations created in `mutations/` folder:
- ✅ `authMutations.ts` - Authentication mutations
- ✅ `depositMutations.ts` - Deposit mutations
- ✅ `withdrawalMutations.ts` - Withdrawal mutations
- ✅ `kycMutations.ts` - KYC mutations
- ✅ `billPaymentMutations.ts` - Bill payment mutations
- ✅ `cryptoMutations.ts` - Crypto mutations
- ✅ `virtualCardMutations.ts` - Virtual card mutations
- ✅ `supportMutations.ts` - Support mutations
- ✅ `chatMutations.ts` - Chat mutations

### 7. Integration Started
- ✅ Login screen integrated with API
- ✅ Error handling implemented
- ✅ Loading states added

---

## 📦 Installation Steps

### Step 1: Install Dependencies

```bash
cd billspro
npm install @tanstack/react-query axios @react-native-async-storage/async-storage
```

### Step 2: Verify Setup

Check that these files exist:
- ✅ `api.config.js`
- ✅ `services/api/apiClient.ts`
- ✅ `services/storage/authStorage.ts`
- ✅ `services/QueryClient.tsx`
- ✅ `queries/` folder with all query files
- ✅ `mutations/` folder with all mutation files
- ✅ `App.tsx` updated with QueryClientProvider

---

## 🚀 Usage Examples

### Using Queries (GET Requests)

```typescript
import { useDashboard, useWalletBalance } from '../queries';

// In your component
const DashboardScreen = () => {
  const { data, isLoading, error } = useDashboard();
  const { data: balance } = useWalletBalance();

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View>
      <Text>Balance: {balance?.data?.fiat?.balance}</Text>
    </View>
  );
};
```

### Using Mutations (POST/PUT/DELETE Requests)

```typescript
import { useLogin } from '../mutations/authMutations';

// In your component
const LoginScreen = () => {
  const loginMutation = useLogin();

  const handleLogin = async () => {
    try {
      const result = await loginMutation.mutateAsync({
        email: 'user@example.com',
        password: 'password123',
      });

      if (result.success) {
        // Navigate to main app
        navigation.navigate('Main');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleLogin}
      disabled={loginMutation.isPending}
    >
      {loginMutation.isPending ? (
        <ActivityIndicator />
      ) : (
        <Text>Login</Text>
      )}
    </TouchableOpacity>
  );
};
```

---

## 📁 Project Structure

```
billspro/
├── api.config.js                 # All API routes configuration
├── services/
│   ├── api/
│   │   └── apiClient.ts         # Axios instance with interceptors
│   ├── storage/
│   │   └── authStorage.ts       # AsyncStorage utilities
│   └── QueryClient.tsx           # TanStack Query client
├── queries/                      # All GET route queries
│   ├── authQueries.ts
│   ├── dashboardQueries.ts
│   ├── walletQueries.ts
│   ├── depositQueries.ts
│   ├── withdrawalQueries.ts
│   ├── transactionQueries.ts
│   ├── kycQueries.ts
│   ├── billPaymentQueries.ts
│   ├── cryptoQueries.ts
│   ├── virtualCardQueries.ts
│   ├── supportQueries.ts
│   ├── chatQueries.ts
│   ├── userQueries.ts
│   └── index.ts                 # Export all queries
├── mutations/                    # All POST/PUT/DELETE mutations
│   ├── authMutations.ts
│   ├── depositMutations.ts
│   ├── withdrawalMutations.ts
│   ├── kycMutations.ts
│   ├── billPaymentMutations.ts
│   ├── cryptoMutations.ts
│   ├── virtualCardMutations.ts
│   ├── supportMutations.ts
│   ├── chatMutations.ts
│   └── index.ts                 # Export all mutations
└── screens/
    └── auth/
        └── LoginScreen.tsx       # ✅ Integrated example
```

---

## 🔄 Next Steps for Integration

### Priority 1: Authentication Flow
1. ✅ Login Screen - DONE
2. Register Screen
3. Verify Email Screen
4. PIN Setup Screen
5. Password Reset Flow

### Priority 2: Core Features
1. Dashboard Screen
2. Wallet Screens
3. Transaction History
4. Deposit Flow
5. Withdrawal Flow

### Priority 3: Bill Payments
1. Airtime Recharge
2. Data Recharge
3. Electricity
4. Cable TV
5. Internet Subscription
6. Betting

### Priority 4: Advanced Features
1. Crypto Operations
2. Virtual Cards
3. KYC Submission

---

## 📝 Integration Pattern

For each screen, follow this pattern:

1. **Import the hook:**
   ```typescript
   import { useDashboard } from '../queries';
   import { useLogin } from '../mutations/authMutations';
   ```

2. **Use in component:**
   ```typescript
   const { data, isLoading, error } = useDashboard();
   const mutation = useLogin();
   ```

3. **Handle loading/error states:**
   ```typescript
   if (isLoading) return <ActivityIndicator />;
   if (error) return <Text>Error: {error.message}</Text>;
   ```

4. **Call mutations:**
   ```typescript
   const handleAction = async () => {
     try {
       const result = await mutation.mutateAsync(data);
       if (result.success) {
         // Handle success
       }
     } catch (error) {
       // Handle error
     }
   };
   ```

---

## 🔧 Configuration

### API Base URL
Located in `api.config.js`:
```javascript
export const API_BASE_URL = 'https://billspro.hmstech.xyz/api';
```

### Query Client Options
Located in `services/QueryClient.tsx`:
- Default stale time: 5 minutes
- Retry: 1 time for queries, 0 for mutations
- Refetch on window focus: disabled

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '@tanstack/react-query'"
**Solution:** Run `npm install @tanstack/react-query axios @react-native-async-storage/async-storage`

### Issue: "Network error"
**Solution:** 
- Check API base URL is correct
- Verify backend is running
- Check network connectivity

### Issue: "401 Unauthorized"
**Solution:**
- Token may be expired
- User needs to login again
- Check token storage

### Issue: "Type errors"
**Solution:**
- Ensure TypeScript is properly configured
- Check import paths
- Verify types match API responses

---

## 📚 Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Axios Docs](https://axios-http.com/)
- [AsyncStorage Docs](https://react-native-async-storage.github.io/async-storage/)

---

## ✅ Integration Checklist

- [x] API configuration created
- [x] API client setup
- [x] Storage utilities
- [x] QueryClient provider
- [x] All queries created
- [x] All mutations created
- [x] Login screen integrated
- [ ] Register screen
- [ ] Verify email screen
- [ ] Dashboard screen
- [ ] All other screens...

---

**Last Updated:** [Current Date]
**Status:** Foundation Complete, Integration In Progress
