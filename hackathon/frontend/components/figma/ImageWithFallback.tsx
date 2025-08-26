import React, { useState } from 'react';
import { Image, View, StyleSheet, ImageProps, ImageSourcePropType } from 'react-native';

// 에러 상태를 위한 기본 이미지 (Base64 데이터 URI)
const ERROR_IMAGE_URI = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

interface ImageWithFallbackProps extends Omit<ImageProps, 'source'> {
  src: string;
  alt?: string;
}

export function ImageWithFallback({ src, alt, style, ...props }: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false);

  const handleError = () => {
    setDidError(true);
  };

  if (didError) {
    return (
      <View style={[styles.errorContainer, style]}>
        <Image
          source={{ uri: ERROR_IMAGE_URI }}
          style={styles.errorImage}
          accessibilityLabel="이미지 로드 오류"
          {...props}
        />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: src } as ImageSourcePropType}
      style={style}
      onError={handleError}
      accessibilityLabel={alt}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorImage: {
    width: 88,
    height: 88,
    opacity: 0.3,
  },
});
