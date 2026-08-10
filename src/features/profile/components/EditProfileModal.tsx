import React, { useEffect } from 'react';
import { Modal, StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { useAppTheme } from '../../../core/theme/ThemeProvider';
import { Typography } from '../../../design/components/Typography';
import { TextField } from '../../../design/components/TextField';
import { SelectionField } from '../../../design/components/SelectionField';
import { Button } from '../../../design/components/Button';
import { LocationAutocomplete, LocationValue } from '../../../design/components/LocationAutocomplete';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useToastStore } from '../../../design/components/Toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().optional(),
  gender: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export const EditProfileModal = ({ visible, onClose }: EditProfileModalProps) => {
  const { theme } = useAppTheme();
  const { user, updateProfile } = useAuthStore();
  const showToast = useToastStore(state => state.showToast);

  const { control, handleSubmit, reset, setValue, watch, formState: { errors, isDirty } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      mobile: user?.mobile || '',
      gender: user?.gender || '',
      city: user?.city || '',
      state: user?.state || '',
      address: user?.address || '',
    },
  });

  // Only show a saved location in the autocomplete widget if it looks like
  // a proper "City, State" value (not a country name or garbage).
  const cityVal = watch('city');
  const stateVal = watch('state');
  // locationDisplay is used purely for the widget's display text
  const locationDisplay = (cityVal && stateVal) ? `${cityVal}, ${stateVal}` : '';

  // Reset form when visible or user changes
  useEffect(() => {
    if (visible && user) {
      reset({
        name: user.name,
        email: user.email,
        mobile: user.mobile || '',
        gender: user.gender || '',
        city: user.city || '',
        state: user?.state || '',
        address: user.address || '',
      });
    }
  }, [visible, user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    await updateProfile(data);
    showToast('Profile updated successfully', 'success');
    onClose();
  };

  const handleClose = () => {
    if (isDirty) reset();
    onClose();
  };

  /** Called when the user picks a suggestion from LocationAutocomplete */
  const handleLocationSelect = (loc: LocationValue) => {
    setValue('city', loc.city || loc.displayName, { shouldDirty: true });
    setValue('state', loc.state, { shouldDirty: true });
    // Pre-fill address only if it's currently empty
    if (!watch('address') && loc.displayName) {
      setValue('address', loc.displayName, { shouldDirty: true });
    }
  };

  /** Called when the user clears the location */
  const handleLocationClear = () => {
    setValue('city', '', { shouldDirty: true });
    setValue('state', '', { shouldDirty: true });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Pressable onPress={handleClose} hitSlop={16} accessibilityLabel="Close edit profile">
            <X color={theme.colors.textPrimary} size={24} />
          </Pressable>
          <Typography variant="title" weight="bold">Edit Profile</Typography>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.formContainer}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Full Name */}
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <TextField
                label="Full Name"
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
                placeholder="Enter your full name"
              />
            )}
          />

          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextField
                label="Email Address"
                value={value}
                onChangeText={onChange}
                error={errors.email?.message}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="Enter your email"
              />
            )}
          />

          {/* Mobile */}
          <Controller
            control={control}
            name="mobile"
            render={({ field: { onChange, value } }) => (
              <TextField
                label="Mobile Number"
                value={value}
                onChangeText={onChange}
                error={errors.mobile?.message}
                keyboardType="phone-pad"
                placeholder="Optional"
              />
            )}
          />

          {/* Gender */}
          <Controller
            control={control}
            name="gender"
            render={({ field: { onChange, value } }) => (
              <SelectionField
                variant="dropdown"
                label="Gender"
                value={value || ''}
                onChange={onChange}
                options={[
                  { label: 'Male', value: 'Male' },
                  { label: 'Female', value: 'Female' },
                  { label: 'Non-binary', value: 'Non-binary' },
                  { label: 'Prefer not to say', value: 'Prefer not to say' },
                  { label: 'Other', value: 'Other' },
                ]}
              />
            )}
          />

          {/* ── Location (India address autocomplete) ───────────────────── */}
          <LocationAutocomplete
            label="Location (City / Area)"
            value={locationDisplay}
            onSelect={handleLocationSelect}
            onClear={handleLocationClear}
            error={errors.city?.message}
          />

          {/* Show selected city & state as read-only chips if set */}
          {(cityVal || stateVal) ? (
            <View style={[styles.locationChips, { borderColor: theme.colors.border }]}>
              {cityVal ? (
                <View style={[styles.chip, { backgroundColor: theme.colors.surfaceHighlight }]}>
                  <Typography variant="caption" color={theme.colors.textSecondary}>City</Typography>
                  <Typography variant="caption" weight="bold" color={theme.colors.accent} style={{ marginTop: 1 }}>
                    {cityVal}
                  </Typography>
                </View>
              ) : null}
              {stateVal ? (
                <View style={[styles.chip, { backgroundColor: theme.colors.surfaceHighlight }]}>
                  <Typography variant="caption" color={theme.colors.textSecondary}>State</Typography>
                  <Typography variant="caption" weight="bold" color={theme.colors.accent} style={{ marginTop: 1 }}>
                    {stateVal}
                  </Typography>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Address — free text, pre-filled from selection */}
          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, value } }) => (
              <TextField
                label="Address (optional)"
                value={value}
                onChangeText={onChange}
                error={errors.address?.message}
                placeholder="House / Street / Landmark"
              />
            )}
          />
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
          <Button
            label="Save Changes"
            onPress={handleSubmit(onSubmit)}
            variant="primary"
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    padding: 24,
    gap: 8,
    paddingBottom: 40,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  locationChips: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
    marginBottom: 8,
  },
  chip: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});
