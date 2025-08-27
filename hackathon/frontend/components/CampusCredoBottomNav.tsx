import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface TabItem {
  key: string;
  title: string;
  icon: string;
  route: string;
}

const tabs: TabItem[] = [
  {
    key: 'home',
    title: '홈',
    icon: 'home',
    route: '/home'
  },
  {
    key: 'chronicle',
    title: '크로니클',
    icon: 'activity',
    route: '/chronicle'
  },
  {
    key: 'quest',
    title: '퀘스트',
    icon: 'target',
    route: '/quest'
  },
  {
    key: 'skill',
    title: '스킬 트리',
    icon: 'trending-up',
    route: '/skill-tree'
  },
  {
    key: 'my',
    title: 'MY',
    icon: 'user',
    route: '/my-campus-credo'
  }
];

export function CampusCredoBottomNav() {
  const pathname = usePathname();
  const indicatorPosition = useSharedValue(0);

  const getActiveTabIndex = () => {
    const activeTab = tabs.findIndex(tab => tab.route === pathname);
    return activeTab !== -1 ? activeTab : 0;
  };

  const activeIndex = getActiveTabIndex();

  React.useEffect(() => {
    const newPosition = (activeIndex * screenWidth) / tabs.length + (screenWidth / tabs.length) / 2;
    indicatorPosition.value = withSpring(newPosition, {
      damping: 15,
      stiffness: 150,
    });
  }, [activeIndex]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value - 20 }],
  }));

  const handleTabPress = (tab: TabItem, index: number) => {
    router.push(tab.route);
  };

  const isActive = (index: number) => index === activeIndex;

  return (
    <View style={styles.container}>
      {/* 활성 탭 인디케이터 */}
      <Animated.View style={[styles.activeIndicator, indicatorStyle]} />
      
      {/* 탭 버튼들 */}
      <View style={styles.tabContainer}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => handleTabPress(tab, index)}
            activeOpacity={0.7}
          >
            <Animated.View style={[
              styles.tabContent,
              isActive(index) && styles.tabContentActive
            ]}>
              <Feather 
                name={tab.icon as any} 
                size={20} 
                color={isActive(index) ? '#3B82F6' : '#9CA3AF'} 
              />
              <Text style={[
                styles.tabText,
                isActive(index) && styles.tabTextActive
              ]}>
                {tab.title}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 8,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 40,
    height: 3,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    minHeight: 48,
  },
  tabContentActive: {
    backgroundColor: '#EBF4FF',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 4,
  },
  tabTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});
