'use strict'

/* eslint-disable max-len */

// Should be the same as index.js, but without classes that using Node's sdt libs like `fs`

// config
exports.AccessibilityLevel = require('./lib/config/AccessibilityLevel').AccessibilityLevel
exports.AccessibilityMatchSettings = require('./lib/config/AccessibilityMatchSettings').AccessibilityMatchSettings
exports.AccessibilityRegionType = require('./lib/config/AccessibilityRegionType').AccessibilityRegionType
exports.BatchInfo = require('./lib/config/BatchInfo').BatchInfo
exports.BrowserType = require('./lib/config/BrowserType').BrowserType
exports.Configuration = require('./lib/config/Configuration').Configuration
exports.DeviceName = require('./lib/config/DeviceName').DeviceName
exports.ExactMatchSettings = require('./lib/config/ExactMatchSettings').ExactMatchSettings
exports.FloatingMatchSettings = require('./lib/config/FloatingMatchSettings').FloatingMatchSettings
exports.ImageMatchSettings = require('./lib/config/ImageMatchSettings').ImageMatchSettings
exports.MatchLevel = require('./lib/config/MatchLevel').MatchLevel
exports.PropertyData = require('./lib/config/PropertyData').PropertyData
exports.ProxySettings = require('./lib/config/ProxySettings').ProxySettings
exports.ScreenOrientation = require('./lib/config/ScreenOrientation').ScreenOrientation
exports.SessionType = require('./lib/config/SessionType').SessionType
exports.StitchMode = require('./lib/config/StitchMode').StitchMode

// errors
exports.EyesError = require('./lib/errors/EyesError').EyesError

// geometry
exports.CoordinatesType = require('./lib/geometry/CoordinatesType').CoordinatesType
exports.Location = require('./lib/geometry/Location').Location
exports.RectangleSize = require('./lib/geometry/RectangleSize').RectangleSize
exports.Region = require('./lib/geometry/Region').Region

// handler
exports.PropertyHandler = require('./lib/handler/PropertyHandler').PropertyHandler
exports.ReadOnlyPropertyHandler = require('./lib/handler/ReadOnlyPropertyHandler').ReadOnlyPropertyHandler
exports.SimplePropertyHandler = require('./lib/handler/SimplePropertyHandler').SimplePropertyHandler

// images
exports.ImageDeltaCompressor = require('./lib/images/ImageDeltaCompressor').ImageDeltaCompressor

// utils
exports.ArgumentGuard = require('./lib/utils/ArgumentGuard').ArgumentGuard
// exports.ConfigUtils = require('./lib/utils/ConfigUtils').ConfigUtils;                  uses `fs` library
exports.DateTimeUtils = require('./lib/utils/DateTimeUtils').DateTimeUtils
// exports.FileUtils = require('./lib/utils/FileUtils').FileUtils;                        uses `fs` library
exports.GeneralUtils = require('./lib/utils/GeneralUtils').GeneralUtils
exports.PerformanceUtils = require('./lib/utils/PerformanceUtils').PerformanceUtils
exports.StreamUtils = require('./lib/utils/StreamUtils')
exports.TypeUtils = require('./lib/utils/TypeUtils').TypeUtils
