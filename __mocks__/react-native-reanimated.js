/**
 * Custom reanimated mock for Jest — avoids react-native-worklets native init.
 * All animation functions are spies so tests can assert they were called.
 */
const React = require('react');
const { View, Text, Image, ScrollView } = require('react-native');

const useSharedValue = jest.fn((init) => ({ value: init }));
const useAnimatedStyle = jest.fn(() => ({}));
const useAnimatedReaction = jest.fn();
const useAnimatedProps = jest.fn(() => ({}));
const useDerivedValue = jest.fn((fn) => ({ value: fn() }));

const withTiming = jest.fn((toValue) => toValue);
const withSpring = jest.fn((toValue) => toValue);
const withDelay = jest.fn((_delay, animation) => animation);
const withSequence = jest.fn((...animations) => animations[animations.length - 1]);
const withRepeat = jest.fn((animation) => animation);
const cancelAnimation = jest.fn();
const runOnJS = jest.fn((fn) => fn);
const interpolateColor = jest.fn((_v, _in, out) => out[out.length - 1]);

// Animated components are just their base RN equivalents
const Animated = {
  View: View,
  Text: Text,
  Image: Image,
  ScrollView: ScrollView,
  createAnimatedComponent: (Component) => Component,
};

module.exports = {
  default: Animated,
  ...Animated,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  useAnimatedProps,
  useDerivedValue,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  cancelAnimation,
  runOnJS,
  interpolateColor,
  Easing: { bezier: jest.fn(() => jest.fn()), linear: jest.fn(), ease: jest.fn() },
  SlideInRight: {},
  SlideOutLeft: {},
  FadeIn: {},
  FadeOut: {},
  Layout: {},
};
