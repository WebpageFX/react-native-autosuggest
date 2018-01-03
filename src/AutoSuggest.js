import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  ListView,
  TouchableOpacity,
  View,
  Keyboard,
  TouchableWithoutFeedback,
  Button
} from 'react-native'
import debounce from '../vendor/throttle-debounce/debounce'
import { version } from 'react-native/package.json'
const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 })

// https://github.com/posabsolute/javascript-binary-search-algorithm
const searchBinary = function(needle, haystack, case_insensitive) {
		if(needle == "") return [];
		var haystackLength 	= haystack.length;
		var letterNumber 	= needle.length;
		case_insensitive 	= (typeof(case_insensitive) === 'undefined' || case_insensitive) ? true:false;
		needle 				= (case_insensitive) ? needle.toLowerCase():needle;

		/* start binary search, Get middle position */
		var getElementPosition = findElement()

		/* get interval and return result array */
		if(getElementPosition == -1) return [];
		return getRangeElement = findRangeElement()

		function findElement() {
			if (typeof(haystack) === 'undefined' || !haystackLength) return -1;

			var high = haystack.length - 1;
			var low = 0;

			while (low <= high) {
				mid = parseInt((low + high) / 2);
				var element = haystack[mid].substr(0,letterNumber);
				element = (case_insensitive) ? element.toLowerCase():element;

				if (element > needle) {
					high = mid - 1;
				} else if (element < needle) {
					low = mid + 1;
				} else {

					return mid;
				}
			}
			return -1;
		}
		function findRangeElement(){

			for(i=getElementPosition; i>0; i--){
				var element =  (case_insensitive) ? haystack[i].substr(0,letterNumber).toLowerCase() : haystack[i].substr(0,letterNumber);
				if(element != needle){
					var start = i+1;
					break;
				}else{
					var start = 0;
				}
			}
			for(i=getElementPosition; i<haystackLength; i++ ){
				var element =  (case_insensitive) ? haystack[i].substr(0,letterNumber).toLowerCase() : haystack[i].substr(0,letterNumber);
				if(element != needle){
					var end = i;
					break;
				}else{
					var end = haystackLength -1;
				}
			}
			var result = [];
			for(i=start; i<end;i++){
				result.push(haystack[i])
			}

			return result;
		}

	};



export default class AutoSuggest extends Component {
  static propTypes = {
    containerStyles: PropTypes.object,
    clearBtnStyles: PropTypes.object,
    clearBtnVisibility: PropTypes.bool,
    otherTextInputProps: PropTypes.object,
    placeholder: PropTypes.string, // textInput
    placeholderTextColor: PropTypes.string,
    onChangeText: PropTypes.func,
    onChangeTextDebounce: PropTypes.number,
    onItemPress: PropTypes.func,
    rowTextStyles: PropTypes.object,
    rowWrapperStyles: PropTypes.object,
    textInputStyles: PropTypes.object,
    terms: PropTypes.array

  }

  static defaultProps = {
    terms: [],
    clearBtnVisibility: false,
    placeholder: '',
    textInputStyles: {},
    otherTextInputProps: {},
    onChangeTextDebounce: 200
  }
  getInitialStyles () {
    const { textInputStyles } = this.props
    return {
      rowWrapperStyles: {
        zIndex: 999,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 5,
        paddingRight: 5,
        opacity: 0.8,
        borderTopColor: 'lightgrey',
        borderBottomColor: 'lightgrey',
        borderBottomWidth: 1
      },
      rowTextStyles: {

      },
      clearBtnStyles: {

      },
      containerStyles: {
        zIndex: 999,
        width: 300,
        backgroundColor: textInputStyles.backgroundColor || 'white'
      },
      textInputStyles: { // textInput Styles
        paddingLeft: 5,
        paddingRight: 5,
        flex: 1,
        alignItems: 'center',
        height: 40
      }
    }
  }
  constructor (props) {
    super(props)
    this.clearTerms = this.clearTerms.bind(this)
    this.searchTerms = this.searchTerms.bind(this)
    this.setCurrentInput = this.setCurrentInput.bind(this)
    this.onItemPress = this.onItemPress.bind(this)
    this._renderSearching = this._renderSearching.bind(this)
    this.state = {
      TIWidth: null,
      results: [],
      currentInput: null,
      searching: false
    }
  }
  componentDidMount () {
    // when user hits the return button, clear the terms
    Keyboard.addListener('keyboardDidHide', () => this.clearTerms())
  }

  getAndSetWidth () {
    this.refs.TI.measure((ox, oy, width, ...rest) => {
      this.setState({ TIWidth: width })
    })
  }
  setCurrentInput (currentInput) {
    this.setState({currentInput})
  }

  clearInputAndTerms () {
    this.refs.TI.clear()
    this.clearTerms()
  }
  clearTerms () { this.setState({results: []}) }
  addAllTerms () { this.setState({results: this.props.terms}) }
  searchTerms (currentInput) {
    this.setState({ currentInput, searching: true });
    debounce(300, () => {
      this.getAndSetWidth()
      // if input is empty don't show any results
      if( !!(currentInput.length <= 0)) {
          this.setState({results: [], searching: false})
          return;
      }

      // const findMatch = (term1, term2) => term1.toLowerCase().indexOf(term2.toLowerCase()) > -1
      // const results = this.props.terms.filter(eachTerm => {
      //   if (findMatch(eachTerm, currentInput)) return eachTerm
      // })
      const results = searchBinary(currentInput, this.props.terms, true);
      this.setState({results: results, searching: false})
    })()
  }

  // copy the value back to the input
  onItemPress (currentInput) {
    this.setCurrentInput(currentInput)
    this.clearTerms()
  }
  getCombinedStyles (styleName) {
    let styleObj
    if (typeof this.props.styleName !== 'object') { // this is if its a stylesheet reference
      styleObj = StyleSheet.flatten([this.getInitialStyles()[styleName], this.props[styleName]])
    } else {
      // combine the  initial i.e default styles into one object.
      styleObj = { ...this.getInitialStyles()[styleName], ...this.props[styleName] }
    }
    return styleObj
  }

  _renderSearching() {
      if(! this.state.searching)
        return null;

      return (
          <View style={{
              width: this.state.TIWidth,
              backgroundColor: '#fff'
          }}>
              <Text style={{
                  color: '#999',
                  padding: 6,

              }}>Searching...</Text>
          </View>
      );
  }

  render () {
    const {
      otherTextInputProps,
      placeholder,
      placeholderTextColor,
      clearBtn,
      clearBtnVisibility,
      onChangeTextDebounce,
      onItemPress
    } = this.props
    return (
      <View style={this.getCombinedStyles('containerStyles')}>
          <View
              ref="TIContainer"
              style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
              <TextInput
                  {...otherTextInputProps}
                  placeholderTextColor={placeholderTextColor}
                  ref="TI"
                  spellCheck={false}
                  defaultValue={this.state.currentInput}
                  onChangeText={(el) => {
                      this.searchTerms(el)
                      debounce(onChangeTextDebounce, this.props.onChangeText(el))
                  }}
                  placeholder={placeholder}
                  style={this.getCombinedStyles('textInputStyles')}
              />

              { clearBtn // for if the user just wants the default clearBtn
                  ? <TouchableOpacity onPress={() => this.clearInputAndTerms()}>
                      { clearBtn }
                  </TouchableOpacity>
                  : false }

              { !clearBtn && clearBtnVisibility // for if the user passes a custom btn comp.
                  ? <Button style={this.getCombinedStyles('clearBtnStyles')} title="Clear" onPress={() => this.clearInputAndTerms()} />
                  : false
              }
          </View>
          <View>
              <View
                  style={{position: 'absolute', width: this.state.TIWidth, backgroundColor: 'white', zIndex: 3}}
              >
                  { this._renderSearching() }
                  {this.state.results.map((rowData, rowId) => (
                      <RowWrapper
                          styles={this.getCombinedStyles('rowWrapperStyles')}
                          key={rowData+'_'+rowId}
                      >
                          <TouchableOpacity
                              activeOpacity={0.5 /* when you touch it the text color grimaces */}
                              onPress={() => {
                                  this.onItemPress(this.state.results[rowId])
                                  if (onItemPress) onItemPress(this.state.results[rowId])
                              }
                              }
                          >
                              <Text style={this.getCombinedStyles('rowTextStyles')}>{rowData}</Text>
                          </TouchableOpacity>
                      </RowWrapper>
                  ))}
              </View>
          </View>

    </View>

    )
  }
}

class RowWrapper extends Component {
  constructor (props) {
    super(props)

    this.defaultTransitionDuration = 500
    this.state = {
      opacity: new Animated.Value(0)
    }
  }
  componentDidMount () {
    Animated.timing(this.state.opacity, {
      toValue: 1,
      duration: this.defaultTransitionDuration
    }).start()
  }
  render () {
    return (
      <TouchableWithoutFeedback>
        <Animated.View style={{...this.props.styles, opacity: this.state.opacity }}>
          {this.props.children}
        </Animated.View>
      </TouchableWithoutFeedback>
    )
  }
}
