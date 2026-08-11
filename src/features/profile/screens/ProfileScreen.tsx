import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Edit2, LogOut, Moon, Sun, Info, Trash2, Smartphone } from 'lucide-react-native';
import { Typography } from '../../../design/components/Typography';
import { useAppTheme } from '../../../core/theme/ThemeProvider';
import { useThemeStore, ThemeMode } from '../../../core/theme/useThemeStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { SceneProvider } from '../../../experience/scene/SceneProvider';
import { EditProfileModal } from '../components/EditProfileModal';
import { AvatarPickerModal } from '../components/AvatarPickerModal';
import { ConfirmDialog } from '../../../design/components/ConfirmDialog';
import { SelectionField } from '../../../design/components/SelectionField';
import { usePressEffect } from '../../../experience/interactions/usePressEffect';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ShieldCheck, Award } from 'lucide-react-native';
import { theme } from '../../../core/theme/theme';
import { GlassCard } from '../../../design/components/GlassCard';

export const ProfileScreen = () => {
  const { theme, isDark } = useAppTheme();
  const { user, logout } = useAuthStore();
  const { mode, setMode } = useThemeStore();

  // Centralized glow token, not a scattered inline rgba() literal.
  const [glowR, glowG, glowB] = theme.glow.primary.rgb;
  const membershipBg = `rgba(${glowR}, ${glowG}, ${glowB}, ${theme.glow.primary.low})`;
  const membershipBorder = `rgba(${glowR}, ${glowG}, ${glowB}, ${theme.glow.primary.medium})`;

  const personalInfo = [
    user?.mobile && { label: 'Mobile', value: user.mobile },
    user?.gender && { label: 'Gender', value: user.gender.charAt(0).toUpperCase() + user.gender.slice(1) },
    user?.address && { label: 'Address', value: user.address },
    user?.city && { label: 'City', value: user.state ? `${user.city}, ${user.state}` : user.city },
  ].filter(Boolean) as { label: string; value: string }[];
  
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isAvatarModalVisible, setAvatarModalVisible] = useState(false);
  const [isLogoutDialogVisible, setLogoutDialogVisible] = useState(false);

  const handleLogout = () => {
    setLogoutDialogVisible(false);
    logout();
  };

  return (
    <SceneProvider showArch={false}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.header}>
          <Typography variant="headingXL" weight="bold">Patron Portal</Typography>
          <Typography variant="body" color={theme.colors.textSecondary} style={{ marginTop: theme.spacing.xs }}>
            Exclusive museum membership & preferences.
          </Typography>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(600).springify()}>
          <GlassCard style={styles.profileCard}>
            <View style={[styles.membershipHeader, { backgroundColor: membershipBg, borderColor: membershipBorder }]}>
              <Award size={16} color={theme.colors.accent} />
              <Typography variant="caption" weight="bold" color={theme.colors.accent} style={{ marginLeft: 6, letterSpacing: 1.2 }}>
                PATRON MEMBERSHIP • NO. {user?.id || '89201'}
              </Typography>
            </View>

            <Pressable onPress={() => setAvatarModalVisible(true)} style={styles.avatarPressable}>
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatar} contentFit="cover" />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                  <Typography variant="headingL" color={theme.colors.surface}>
                    {user?.name?.charAt(0).toUpperCase() || 'P'}
                  </Typography>
                </View>
              )}
              <View style={[styles.editBadge, { backgroundColor: theme.colors.surface }]}>
                <Edit2 size={12} color={theme.colors.textPrimary} />
              </View>
            </Pressable>

            <View style={styles.profileInfo}>
              <Typography variant="headingM" weight="bold">{user?.name || 'Curator Patron'}</Typography>
              <Typography variant="body" color={theme.colors.textSecondary}>{user?.email || 'patron@museum.art'}</Typography>
              {user?.city && (
                <Typography variant="caption" color={theme.colors.textTertiary} style={{ marginTop: 2 }}>{user.city}</Typography>
              )}
            </View>

            <InteractiveAction 
              icon={<Edit2 size={20} color={theme.colors.textPrimary} />} 
              label="Update Patron Credentials" 
              onPress={() => setEditModalVisible(true)} 
            />
          </GlassCard>
        </Animated.View>

        {/* Settings Sections */}
        <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} style={styles.sections}>

          {/* Personal Information — only shown once there's something to show */}
          {personalInfo.length > 0 && (
            <Section title="Personal Information">
              {personalInfo.map((row, index) => (
                <View
                  key={row.label}
                  style={[styles.inlineRow, index < personalInfo.length - 1 && styles.inlineRowDivider]}
                >
                  <Typography variant="body" color={theme.colors.textSecondary}>{row.label}</Typography>
                  <Typography
                    variant="body"
                    weight="medium"
                    numberOfLines={1}
                    style={styles.infoValue}
                  >
                    {row.value}
                  </Typography>
                </View>
              ))}
            </Section>
          )}

          {/* Appearance */}
          <Section title="Exhibition Lighting">
            <View style={{ paddingVertical: theme.spacing.xs }}>
              <View style={styles.rowLabel}>
                {isDark ? <Moon size={20} color={theme.colors.textPrimary} /> : <Sun size={20} color={theme.colors.textPrimary} />}
                <Typography variant="body" weight="medium" style={{ marginLeft: theme.spacing.md }}>Theme Mode</Typography>
              </View>
              <View style={{ marginTop: theme.spacing.sm }}>
                <SelectionField
                  variant="radio"
                  label=""
                  value={mode}
                  onChange={(val: string) => setMode(val as ThemeMode)}
                  options={[
                    { label: 'System', value: 'system' },
                    { label: 'Light', value: 'light' },
                    { label: 'Dark', value: 'dark' }
                  ]}
                />
              </View>
            </View>
          </Section>

          {/* Account */}
          <Section title="Curator Account">
            <InteractiveAction 
              icon={<LogOut size={20} color={theme.colors.error} />} 
              label="Sign Out of Portal" 
              color={theme.colors.error}
              onPress={() => setLogoutDialogVisible(true)} 
            />
          </Section>

          {/* About */}
          <Section title="Exhibition Architecture">
            <View style={styles.inlineRow}>
              <View style={styles.rowLabel}>
                <ShieldCheck size={20} color={theme.colors.textSecondary} />
                <Typography variant="body" color={theme.colors.textSecondary} style={{ marginLeft: theme.spacing.md }}>Engine Version</Typography>
              </View>
              <Typography variant="body" weight="bold" color={theme.colors.accent}>v1.0.0 (Flagship)</Typography>
            </View>
          </Section>
        </Animated.View>

      </ScrollView>

      {/* Modals */}
      <EditProfileModal visible={isEditModalVisible} onClose={() => setEditModalVisible(false)} />
      <AvatarPickerModal visible={isAvatarModalVisible} onClose={() => setAvatarModalVisible(false)} />
      <ConfirmDialog
        visible={isLogoutDialogVisible}
        title="Sign Out"
        description="Are you sure you want to exit the patron portal? Your session will be saved."
        confirmLabel="Sign Out"
        isDestructive={true}
        onConfirm={handleLogout}
        onCancel={() => setLogoutDialogVisible(false)}
      />
    </SceneProvider>
  );
};

// Sub-components for structure
const Section = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const { theme } = useAppTheme();
  return (
    <View style={styles.section}>
      <Typography variant="label" weight="bold" color={theme.colors.textSecondary} style={{ marginBottom: theme.spacing.md, textTransform: 'uppercase', letterSpacing: 1 }}>
        {title}
      </Typography>
      <GlassCard style={styles.sectionCard}>
        {children}
      </GlassCard>
    </View>
  );
};

const InteractiveAction = ({ icon, label, onPress, color }: { icon: React.ReactNode, label: string, onPress: () => void, color?: string }) => {
  const { theme } = useAppTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressEffect(0.98);
  
  return (
    <Animated.View style={animatedStyle}>
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={styles.actionRow}>
        <View style={styles.rowLabel}>
          {icon}
          <Typography variant="body" color={color || theme.colors.textPrimary} style={{ marginLeft: theme.spacing.md }}>
            {label}
          </Typography>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    paddingBottom: 160,
  },
  header: {
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  profileCard: {
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  membershipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm + 4,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadii.full,
    borderWidth: 1,
  },
  avatarPressable: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sections: {
    paddingHorizontal: 24,
    gap: 24,
  },
  section: {
    // marginBottom: 24,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  inlineRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  infoValue: {
    flexShrink: 1,
    marginLeft: theme.spacing.md,
    textAlign: 'right',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});
