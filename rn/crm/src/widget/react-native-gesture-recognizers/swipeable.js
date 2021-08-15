'use strict';

import React, {Component} from 'react';
import {PanResponder, View} from 'react-native';
import isValidSwipe from './utils/isValidSwipe';
import PropTypes from 'prop-types'

const directions = {
  SWIPE_UP: 'SWIPE_UP',
  SWIPE_DOWN: 'SWIPE_DOWN',
  SWIPE_LEFT: 'SWIPE_LEFT',
  SWIPE_RIGHT: 'SWIPE_RIGHT'
};

const propTypes = {
  onSwipeBegin: PropTypes.func,
  onSwipe: PropTypes.func,
  onSwipeEnd: PropTypes.func,
  swipeDecoratorStyle: PropTypes.object
};

const swipeable = ({
                     horizontal = false,
                     vertical = false,
                     left = false,
                     right = false,
                     up = false,
                     down = false,
                     continuous = true,
                     initialVelocityThreshold = 0.7,
                     verticalThreshold = 10,
                     horizontalThreshold = 10,
                     setGestureState = true
                   } = {}) => BaseComponent => {
  
  const checkHorizontal = horizontal || (left || right);
  const checkVertical = vertical || (up || down);
  
  return class extends Component {
    
    static propTypes = propTypes;
    
    constructor (props, context) {
      super(props, context);
      
      this.state = {
        swipe: {
          direction: null,
          distance: 0,
          velocity: 0
        }
      };
      
      this.swipeDetected = false;
      this.velocityProp = null;
      this.distanceProp = null;
      this.swipeDirection = null;
    }
    
    UNSAFE_componentWillMount () {
      this.panResponder = PanResponder.create({
        
        onStartShouldSetPanResponder: (evt) => {
          // console.log('onStartShouldSetPanResponder => ', evt)
          return evt.nativeEvent.touches.length === 1;
        },
        
        onMoveShouldSetPanResponder: (evt) => {
          // console.log('onMoveShouldSetPanResponder => ', evt)
          return evt.nativeEvent.touches.length === 1;
        },
        
        onPanResponderMove: (evt, gestureState) => {
          // console.log('onPanResponderMove => ', evt, gestureState)
          const {dx, dy, vx, vy} = gestureState;
          const {onSwipeBegin, onSwipe} = this.props;
          
          if (!continuous && this.swipeDetected) {
            return;
          }
          
          let initialDetection = false;
          let validHorizontal = false;
          let validVertical = false;
          
          if (!this.swipeDetected) {
            initialDetection = true;
            
            validHorizontal = checkHorizontal && isValidSwipe(
              vx, dy, initialVelocityThreshold, verticalThreshold
            );
            validVertical = checkVertical && isValidSwipe(
              vy, dx, initialVelocityThreshold, horizontalThreshold
            );
            // console.log('onPanResponderMove => validHorizontal:', validHorizontal, ';validVertical', validVertical)
            if (validHorizontal) {
              this.velocityProp = 'vx';
              this.distanceProp = 'dx';
              
              if ((horizontal || left) && dx < 0) {
                this.swipeDirection = directions.SWIPE_LEFT;
              } else if ((horizontal || right) && dx > 0) {
                this.swipeDirection = directions.SWIPE_RIGHT;
              }
            } else if (validVertical) {
              this.velocityProp = 'vy';
              this.distanceProp = 'dy';
              
              if ((vertical || up) && dy < 0) {
                this.swipeDirection = directions.SWIPE_UP;
              } else if ((vertical || down) && dy > 0) {
                this.swipeDirection = directions.SWIPE_DOWN;
              }
            }
            // console.log('onPanResponderMove => swipeDirection:', this.swipeDirection)
            if (this.swipeDirection) {
              this.swipeDetected = true;
            }
          }
          
          if (this.swipeDetected) {
            const distance = gestureState[this.distanceProp];
            const velocity = gestureState[this.velocityProp];
            
            const swipeState = {
              direction: this.swipeDirection,
              distance,
              velocity
            };
            
            if (initialDetection) {
              onSwipeBegin && onSwipeBegin(swipeState); // eslint-disable-line no-unused-expressions
            } else {
              onSwipe && onSwipe(swipeState); // eslint-disable-line no-unused-expressions
            }
            
            if (setGestureState) {
              this.setState({
                swipe: swipeState
              });
            }
          }
          
          // console.log('onPanResponderMove => swipeDetected:', this.swipeDetected)
        },
        
        onPanResponderTerminationRequest: () => true,
        onPanResponderTerminate: this.handleTerminationAndRelease,
        onPanResponderRelease: this.handleTerminationAndRelease
      });
    }
    
    handleTerminationAndRelease = () => {
      // console.log('handleTerminationAndRelease => swipeDetected:', this.swipeDetected)
      if (this.swipeDetected) {
        // console.log('handleTerminationAndRelease => props', this.props)
        const {onSwipeEnd} = this.props;
        onSwipeEnd && onSwipeEnd({ // eslint-disable-line no-unused-expressions
          direction: this.swipeDirection
        });
      }
      
      this.swipeDetected = false;
      this.velocityProp = null;
      this.distanceProp = null;
      this.swipeDirection = null;
    }
    
    render () {
      const {
        onSwipeBegin,
        onSwipe,
        onSwipeEnd,
        swipeDecoratorStyle,
        ...props
      } = this.props;
      
      const style = {
        ...swipeDecoratorStyle,
        alignSelf: 'flex-start'
      };
      
      const state = setGestureState ? this.state : null;
      
      return (
        <View {...this.panResponder.panHandlers} style={style}>
          <BaseComponent {...props} {...state} />
        </View>
      );
    }
  };
};

swipeable.directions = directions;

export default swipeable;
