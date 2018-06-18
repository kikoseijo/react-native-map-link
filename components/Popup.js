/**
 * React Native Map Link
 */

import React from 'react'
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator
} from 'react-native'
import PropTypes from 'prop-types'
import Modal from 'react-native-modal'

import { getAvailableApps, checkNotSupportedApps } from '../utils'
import { showLocation } from '../index'
import { titles, icons, colors } from '../constants'

const {height: SCREEN_HEIGHT} = Dimensions.get('screen')

export class Popup extends React.Component {
  static propTypes = {
    isVisible: PropTypes.bool,
    showHeader: PropTypes.bool,
    onBackButtonPress: PropTypes.func,
    onAppPressed: PropTypes.func,
    style: PropTypes.object,
    modalProps: PropTypes.object,
    options: PropTypes.object.isRequired,
    appsWhiteList: PropTypes.array
  }
  static defaultProps = {
    isVisible: false,
    showHeader: true,
    style: {
      container: {},
      itemContainer: {},
      image: {},
      itemText: {},
      headerContainer: {},
      titleText: {},
      subtitleText: {},
      cancelButtonContainer: {},
      cancelButtonText: {},
      separatorStyle: {},
      activityIndicatorContainer: {}
    },
    modalProps: {},
    options: {
      dialogTitle: 'Open with...',
      dialogMessage: '',
      cancelText: 'Cancel'
    },
    appsWhiteList: null,
    onBackButtonPressed: () => { },
    onCancelPressed: () => {},
    onAppPressed: () => {}
  }

  componentDidMount = async () => {
    const { appsWhiteList } = this.props
    this.loading = true
    this.apps = await getAvailableApps()
    if (appsWhiteList && appsWhiteList.length) {
      checkNotSupportedApps(appsWhiteList)
      this.apps = this.apps
        .filter(appName => this.props.appsWhiteList.includes(appName))  
    }
    this.loading = false
  }

  _renderHeader = () => {
    const {showHeader, options} = this.props
    const {dialogTitle, dialogMessage} = options

    return showHeader ? (
      <View style={[styles.headerContainer, this.props.style.headerContainer]}>
        <Text style={[styles.titleText, this.props.style.titleText]}>{dialogTitle}</Text>
        {dialogMessage && dialogMessage.length ?
          <Text style={[styles.subtitleText, this.props.style.subtitleText]}>{dialogMessage}</Text> : null}
      </View>
    ) : null
  }

  _renderApps = () => {
    if (this.loading) {
      return (
        <View style={[styles.activityIndicatorContainer, this.props.style.activityIndicatorContainer]}>
          <ActivityIndicator size="large" color={colors.black}/>
        </View>
      )
    }

    return (
      <FlatList
        ItemSeparatorComponent={() =>
          <View style={[styles.separatorStyle, this.props.style.separatorStyle]}/>}
        data={this.apps}
        renderItem={this._renderAppItem}
        keyExtractor={(item) => item}
      />
    )
  }

  _renderAppItem = ({item}) => {
    return (
      <TouchableOpacity
        key={item}
        style={[styles.itemContainer, this.props.style.itemContainer]}
        onPress={() => this._onAppPressed({app: item})}
      >
        <View>
          <Image
            style={[styles.image, this.props.style.image]}
            source={icons[item]}
          />
        </View>
        <Text style={[styles.itemText, this.props.style.itemText]}>{titles[item]}</Text>
      </TouchableOpacity>
    )
  }

  _renderCancelButton = () => (
    <TouchableOpacity
      style={[styles.cancelButtonContainer, this.props.style.cancelButtonContainer]}
      onPress={this.props.onCancelPressed}
    >
      <Text style={[styles.cancelButtonText, this.props.style.cancelButtonText]}>{this.props.options.cancelText}</Text>
    </TouchableOpacity>
  )

  _onAppPressed = ({app}) => {
    showLocation({...this.props.options, app})
    this.props.onAppPressed()
  }

  render () {
    return (
      <Modal
        isVisible={this.props.isVisible}
        backdropColor={colors.black}
        animationIn="slideInUp"
        hideModalContentWhileAnimating={true}
        useNativeDriver={true}
        onBackButtonPress={this.props.onBackButtonPressed}
        {...this.props.modalProps}
      >
        <View style={[styles.container, this.props.style.container]}>
          {this._renderHeader()}
          {this._renderApps()}
          {this._renderCancelButton()}
        </View>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    maxHeight: SCREEN_HEIGHT * .6
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20
  },
  image: {
    width: 50,
    height: 50
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    marginLeft: 15
  },
  headerContainer: {
    borderWidth: 1,
    borderColor: 'transparent',
    borderBottomColor: colors.lightBlue,
    padding: 15
  },
  titleText: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.black
  },
  subtitleText: {
    fontSize: 12,
    color: colors.lightGray,
    textAlign: 'center',
    marginTop: 10
  },
  cancelButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    borderTopColor: colors.lightBlue
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray
  },
  separatorStyle: {
    flex: 1,
    height: 1,
    backgroundColor: colors.lightBlue
  },
  activityIndicatorContainer: {
    height: 70,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
