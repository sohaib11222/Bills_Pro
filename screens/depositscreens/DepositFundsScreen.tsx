import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    Image,
    ImageBackground,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Platform,
    StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';

const { width } = Dimensions.get('window');
type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DepositFundsScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const [depositAmount, setDepositAmount] = useState('');
    const [selectedQuickAmount, setSelectedQuickAmount] = useState<string | null>(null);

    const quickAmounts = ['2,000', '5,000', '10,000', '202,000'];

    const handleNumberPress = (num: string) => {
        if (num === '.') {
            if (!depositAmount.includes('.')) {
                setDepositAmount(depositAmount + num);
            }
        } else {
            setDepositAmount(depositAmount + num);
        }
    };

    const handleBackspace = () => {
        setDepositAmount(depositAmount.slice(0, -1));
    };

    const handleQuickAmount = (amount: string) => {
        setSelectedQuickAmount(amount);
        setDepositAmount(amount.replace(/,/g, ''));
    };

    const handleNext = () => {
        if (depositAmount.trim() !== '') {
            navigation.navigate('DepositAccount', { amount: depositAmount });
        }
    };

    const formatAmount = (amount: string) => {
        if (!amount) return '';
        const num = parseFloat(amount.replace(/,/g, ''));
        if (isNaN(num)) return amount;
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={24} color="#111827" />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Deposit Funds</ThemedText>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Balance Card */}
                <ImageBackground
                    source={require('../../assets/green_background.png')}
                    style={styles.balanceCard}
                    imageStyle={styles.balanceCardImage}
                    resizeMode="cover"
                >
                    <ThemedText style={styles.balanceLabel}>My Balance</ThemedText>
                    <View style={styles.balanceRow}>
                        <ThemedText style={styles.balanceCurrency}>N</ThemedText>
                        <ThemedText style={styles.balanceAmount}>10,000.00</ThemedText>
                    </View>
                </ImageBackground>
                    <View style={styles.transferStrip}>
                        <Image
                            source={require('../../assets/emojione_flag-for-nigeria.png')}
                            style={styles.flagIcon}
                            resizeMode="contain"
                        />
                        <View style={styles.transferInfo}>
                            <ThemedText style={styles.transferTitle}>Instant Transfer</ThemedText>
                            <ThemedText style={styles.transferFee}>Fee: N200</ThemedText>
                        </View>
                    </View>

                {/* Deposit Amount Input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Deposit Amount"
                        placeholderTextColor="#9CA3AF"
                        value={formatAmount(depositAmount)}
                        onChangeText={(text) => setDepositAmount(text.replace(/,/g, ''))}
                        keyboardType="numeric"
                    />
                </View>

                {/* Recently Deposited */}
                <View style={styles.recentSection}>
                    <ThemedText style={styles.recentLabel}>Recently deposited</ThemedText>
                    <View style={styles.quickAmountRow}>
                        {quickAmounts.map((amount) => (
                            <TouchableOpacity
                                key={amount}
                                style={[
                                    styles.quickAmountButton,
                                    selectedQuickAmount === amount && styles.quickAmountButtonActive,
                                ]}
                                onPress={() => handleQuickAmount(amount)}
                                activeOpacity={0.7}
                            >
                                <ThemedText
                                    style={[
                                        styles.quickAmountText,
                                        selectedQuickAmount === amount && styles.quickAmountTextActive,
                                    ]}
                                >
                                    {amount}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Numeric Keypad */}
            <View style={styles.numpadContainer}>
                <View style={styles.numpadLeft}>
                    <View style={styles.numpadRow}>
                        {[1, 2, 3].map((num) => (
                            <TouchableOpacity
                                key={num}
                                style={styles.numButton}
                                onPress={() => handleNumberPress(num.toString())}
                                activeOpacity={0.7}
                            >
                                <ThemedText style={styles.numButtonText}>{num}</ThemedText>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.backspaceButton}
                            onPress={handleBackspace}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="backspace-outline" size={24} color="#000000" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.numpadRow}>
                        {[4, 5, 6].map((num) => (
                            <TouchableOpacity
                                key={num}
                                style={styles.numButton}
                                onPress={() => handleNumberPress(num.toString())}
                                activeOpacity={0.7}
                            >
                                <ThemedText style={styles.numButtonText}>{num}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.numpadRow}>
                        {[7, 8, 9].map((num) => (
                            <TouchableOpacity
                                key={num}
                                style={styles.numButton}
                                onPress={() => handleNumberPress(num.toString())}
                                activeOpacity={0.7}
                            >
                                <ThemedText style={styles.numButtonText}>{num}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.numpadRow}>
                        <TouchableOpacity
                            style={styles.numButton}
                            onPress={() => {}}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="finger-print" size={24} color="#42AC36" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.numButton}
                            onPress={() => handleNumberPress('0')}
                            activeOpacity={0.7}
                        >
                            <ThemedText style={styles.numButtonText}>0</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.numButton}
                            onPress={() => handleNumberPress('.')}
                            activeOpacity={0.7}
                        >
                            <ThemedText style={styles.numButtonText}>.</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.numpadRight}>
                    <TouchableOpacity
                        style={[
                            styles.nextButton,
                            depositAmount.trim() === '' && styles.nextButtonDisabled,
                        ]}
                        onPress={handleNext}
                        disabled={depositAmount.trim() === ''}
                        activeOpacity={0.8}
                    >
                        <ThemedText style={styles.nextButtonText}>Next</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 44 : 44,
        paddingTop:40,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#EFEFEF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
    },
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 350,
    },
    balanceCard: {
        borderRadius: 20,
        padding: 20,
        paddingVertical: 35,
        marginTop: 20,
        // marginBottom: 24,
        overflow: 'hidden',
        zIndex:10
    },
    balanceCardImage: {
        borderRadius: 15,
    },
    balanceLabel: {
        fontSize: 14,
        fontWeight: '400',
        color: '#FFFFFF80',
        opacity: 0.9,
        marginBottom: 17,
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        // marginBottom: 10,
    },
    balanceCurrency: {
        fontSize: 20,
        fontWeight: '400',
        color: '#FFFFFF',
        marginRight: 8,
    },
    balanceAmount: {
        fontSize: 50,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    transferStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop:35,
        backgroundColor: '#42AC3680',
        borderRadius: 20,
        padding: 12,
        paddingBottom:7,
        marginTop:-28,
        marginBottom:25,
        // marginTop: 10,
    },
    flagIcon: {
        width: 32,
        height: 32,
        marginRight: 12,
    },
    transferInfo: {
        flex: 1,
    },
    transferTitle: {
        fontSize: 12,
        fontWeight: '400',
        color: '#111827',
        marginBottom: 4,
    },
    transferFee: {
        fontSize: 8,
        fontWeight: '400',
        color: '#6B7280',
    },
    inputContainer: {
        backgroundColor: '#EFEFEF',
        borderRadius: 15,
        padding: 14,
        marginBottom: 24,
    },
    input: {
        fontSize: 14,
        fontWeight: '400',
        color: '#00000080',
    },
    recentSection: {
        marginBottom: 20,
    },
    recentLabel: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
        marginBottom: 12,
    },
    quickAmountRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    quickAmountButton: {
        backgroundColor: '#EFEFEF',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth:0.5,
        borderColor:'#42AC36',
        paddingVertical: 12,
        minWidth: (width - 64) / 4.4,
    },
    quickAmountButtonActive: {
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#1B800F',
    },
    quickAmountText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#1B800F',
        textAlign: 'center',
    },
    quickAmountTextActive: {
        fontWeight: '600',
    },
    numpadContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 316,
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingTop: 23,
        backgroundColor: '#FFFFFF',
    },
    numpadLeft: {
        flex: 1,
        maxWidth: 290,
    },
    numpadRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    numButton: {
        width: 90,
        height: 60,
        backgroundColor: '#EFEFEF',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    numButtonText: {
        fontSize: 30,
        fontWeight: '400',
        color: '#000000',
    },
    numpadRight: {
        width: 90,
        marginLeft: 15,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    backspaceButton: {
        width: 90,
        height: 60,
        backgroundColor: '#EFEFEF',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        marginBottom: 10,
    },
    nextButton: {
        width: 90,
        height: 200,
        backgroundColor: '#42AC36',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 70,
    },
    nextButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    nextButtonText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#FFFFFF',
    },
});

export default DepositFundsScreen;

