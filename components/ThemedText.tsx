import React from 'react';
import { Text, TextProps } from 'react-native';

export type FontWeight = 'thin' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';

export interface ThemedTextProps extends TextProps {
  weight?: FontWeight;
}

const ThemedText = React.forwardRef<Text, ThemedTextProps>(({ weight = 'regular', style, ...props }, ref) => {
  const fontFamilyMap: Record<FontWeight, string> = {
    thin: 'Manrope-Thin',
    light: 'Manrope-Light',
    regular: 'Manrope-Regular',
    medium: 'Manrope-Medium',
    semibold: 'Manrope-SemiBold',
    bold: 'Manrope-Bold',
    extrabold: 'Manrope-ExtraBold',
  };

  const fontFamily = fontFamilyMap[weight];

  return (
    <Text
      ref={ref}
      style={[
        { fontFamily },
        style,
      ]}
      {...props}
    />
  );
});

ThemedText.displayName = 'ThemedText';

export default ThemedText;

