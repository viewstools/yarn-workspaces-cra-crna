/* eslint-disable jsx-a11y/accessible-emoji, no-unused-vars */
import React from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
const styles = StyleSheet.create({
  hjhrc2t: {
    flexDirection: 'column',
    backgroundColor: 'deepskyblue',
    margin: 50,
  },
  h1w3rbt3: { fontSize: 28 },
});

const Test = props => {
  return (
    <TouchableWithoutFeedback
      activeOpacity={0.7}
      onPress={props.onClick}
      underlayColor="transparent"
    >
      <View testID={props['testID'] || 'Test'} style={styles.hjhrc2t}>
        <Text testID="Test.Text" style={styles.h1w3rbt3}>
          Hey I'm a button!
        </Text>
        {props.children}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Test;
