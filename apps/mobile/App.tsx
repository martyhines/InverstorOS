import { StatusBar } from 'expo-status-bar';
import React from 'react';
import Constants from 'expo-constants';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type UnderwriteResponse = {
  loan_amount: number;
  monthly_principal_and_interest: number;
  monthly_taxes: number;
  monthly_insurance: number;
  monthly_operating_expenses: number;
  monthly_noi: number;
  monthly_piti: number;
  annual_cash_flow: number;
  cash_on_cash_roi: number;
};

const API_URL =
  (Constants.expoConfig as any)?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

// Firebase Auth (email/password minimal)
import { auth } from './src/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

export default function App() {
  const [user, setUser] = React.useState<any>(null);
  const [email, setEmail] = React.useState('demo@example.com');
  const [password, setPassword] = React.useState('password123');

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  const [purchasePrice, setPurchasePrice] = React.useState('300000');
  const [rehabCost, setRehabCost] = React.useState('30000');
  const [monthlyRent, setMonthlyRent] = React.useState('2500');
  const [annualTaxes, setAnnualTaxes] = React.useState('3600');
  const [annualInsurance, setAnnualInsurance] = React.useState('1200');
  const [monthlyHoa, setMonthlyHoa] = React.useState('0');
  const [vacancyRate, setVacancyRate] = React.useState('0.05');
  const [maintenanceRate, setMaintenanceRate] = React.useState('0.08');
  const [managementRate, setManagementRate] = React.useState('0.08');
  const [interestRate, setInterestRate] = React.useState('0.065');
  const [loanTermYears, setLoanTermYears] = React.useState('30');
  const [downPaymentPercent, setDownPaymentPercent] = React.useState('0.2');

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<UnderwriteResponse | null>(null);

  const onEvaluate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = {
        purchase_price: parseFloat(purchasePrice) || 0,
        rehab_cost: parseFloat(rehabCost) || 0,
        monthly_rent: parseFloat(monthlyRent) || 0,
        annual_taxes: parseFloat(annualTaxes) || 0,
        annual_insurance: parseFloat(annualInsurance) || 0,
        monthly_hoa: parseFloat(monthlyHoa) || 0,
        vacancy_rate: parseFloat(vacancyRate) || 0,
        maintenance_rate: parseFloat(maintenanceRate) || 0,
        management_rate: parseFloat(managementRate) || 0,
        interest_rate: parseFloat(interestRate) || 0,
        loan_term_years: parseInt(loanTermYears || '0', 10),
        down_payment_percent: parseFloat(downPaymentPercent) || 0,
      };

      const res = await fetch(`${API_URL}/ai/deals/underwrite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Request failed: ${res.status} ${text}`);
      }

      const data: UnderwriteResponse = await res.json();
      setResult(data);
    } catch (e: any) {
      setError(e?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const NumberField = ({
    label,
    value,
    onChange,
    placeholder,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
  }) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        keyboardType="decimal-pad"
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
      />
    </View>
  );

  const AuthBlock = () => (
    <View style={styles.authBox}>
      {user ? (
        <View style={{ gap: 8 }}>
          <Text style={{ fontWeight: '600' }}>Signed in as {user.email}</Text>
          <TouchableOpacity style={styles.buttonSecondary} onPress={() => signOut(auth)}>
            <Text style={styles.buttonSecondaryText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          <Text style={styles.subtitle}>Sign in to save deals</Text>
          <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} />
          <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={async () => {
              try {
                await signInWithEmailAndPassword(auth, email, password);
              } catch (e: any) {
                setError(e?.message || 'Auth error');
              }
            }}
          >
            <Text style={styles.buttonSecondaryText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>InvestorOS — Deal Evaluator</Text>
        <AuthBlock />

        <NumberField label="Purchase Price" value={purchasePrice} onChange={setPurchasePrice} />
        <NumberField label="Rehab Cost" value={rehabCost} onChange={setRehabCost} />
        <NumberField label="Monthly Rent" value={monthlyRent} onChange={setMonthlyRent} />
        <NumberField label="Annual Taxes" value={annualTaxes} onChange={setAnnualTaxes} />
        <NumberField label="Annual Insurance" value={annualInsurance} onChange={setAnnualInsurance} />
        <NumberField label="Monthly HOA" value={monthlyHoa} onChange={setMonthlyHoa} />
        <NumberField label="Vacancy Rate (0-1)" value={vacancyRate} onChange={setVacancyRate} />
        <NumberField label="Maintenance Rate (0-1)" value={maintenanceRate} onChange={setMaintenanceRate} />
        <NumberField label="Management Rate (0-1)" value={managementRate} onChange={setManagementRate} />
        <NumberField label="Interest Rate (APR)" value={interestRate} onChange={setInterestRate} />
        <NumberField label="Loan Term (years)" value={loanTermYears} onChange={setLoanTermYears} />
        <NumberField label="Down Payment (0-1)" value={downPaymentPercent} onChange={setDownPaymentPercent} />

        <TouchableOpacity style={styles.button} onPress={onEvaluate} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Evaluating…' : 'Evaluate Deal'}</Text>
        </TouchableOpacity>

        {error ? <Text style={styles.error}>Error: {error}</Text> : null}

        {result && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Results</Text>
            <Text>Loan Amount: ${result.loan_amount.toLocaleString()}</Text>
            <Text>Monthly P&I: ${result.monthly_principal_and_interest.toLocaleString()}</Text>
            <Text>Monthly Taxes: ${result.monthly_taxes.toLocaleString()}</Text>
            <Text>Monthly Insurance: ${result.monthly_insurance.toLocaleString()}</Text>
            <Text>Operating Expenses: ${result.monthly_operating_expenses.toLocaleString()}</Text>
            <Text>Monthly NOI: ${result.monthly_noi.toLocaleString()}</Text>
            <Text>Monthly PITI: ${result.monthly_piti.toLocaleString()}</Text>
            <Text>Annual Cash Flow: ${result.annual_cash_flow.toLocaleString()}</Text>
            <Text>CoC ROI: {(result.cash_on_cash_roi * 100).toFixed(2)}%</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#333',
  },
  field: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e3e8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1f6feb',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e1e3e8',
  },
  buttonSecondaryText: {
    color: '#111',
    fontSize: 15,
    fontWeight: '600',
  },
  error: {
    color: '#b00020',
    marginTop: 10,
  },
  resultBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#e1e3e8',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  authBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e1e3e8',
  },
});
