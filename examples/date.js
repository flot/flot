/*
 * Part of "timezone-js" <https://github.com/mde/timezone-js>
 *
 * Copyright 2010 Matthew Eernisse (mde@fleegix.org)
 * and Open Source Applications Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Credits: Ideas included from incomplete JS implementation of Olson
 * parser, "XMLDAte" by Philippe Goetz (philippe.goetz@wanadoo.fr)
 *
 * Contributions:
 * Jan Niehusmann
 * Ricky Romero
 * Preston Hunt (prestonhunt@gmail.com),
 * Dov. B Katz (dov.katz@morganstanley.com),
 * Peter Bergström (pbergstr@mac.com)
*/
if (typeof fleegix == 'undefined') { var fleegix = {}; }
if (typeof timezoneJS == 'undefined') { timezoneJS = {}; }

timezoneJS.Date = function () {
  var args = Array.prototype.slice.apply(arguments);
  var t = null;
  var dt = null;
  var tz = null;
  var utc = false;

  // No args -- create a floating date based on the current local offset
  if (args.length === 0) {
    dt = new Date();
  }
  // Date string or timestamp -- assumes floating
  else if (args.length == 1) {
    dt = new Date(args[0]);
  }
  // year, month, [date,] [hours,] [minutes,] [seconds,] [milliseconds,] [tzId,] [utc]
  else {
    t = args[args.length-1];
    // Last arg is utc
    if (typeof t == 'boolean') {
      utc = args.pop();
      tz = args.pop();
    }
    // Last arg is tzId
    else if (typeof t == 'string') {
      tz = args.pop();
      if (tz == 'Etc/UTC' || tz == 'Etc/GMT') {
        utc = true;
      }
    }

    // Date string (e.g., '12/27/2006')
    t = args[args.length-1];
    if (typeof t == 'string') {
      dt = new Date(args[0]);
    }
    // Date part numbers
    else {
      var a = [];
      for (var i = 0; i < 8; i++) {
        a[i] = args[i] || 0;
      }
      dt = new Date(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7]);
    }
  }
  this._useCache = false;
  this._tzInfo = {};
  this._tzAbbr = '';
  this._day = 0;
  this.year = 0;
  this.month = 0;
  this.date = 0;
  this.hours= 0;
  this.minutes = 0;
  this.seconds = 0;
  this.milliseconds = 0;
  this.timezone = tz || null;
  this.utc = utc || false;
  this.setFromDateObjProxy(dt);
};

timezoneJS.Date.prototype = {
  getDate: function () { return this.date; },
  getDay: function () { return this._day; },
  getFullYear: function () { return this.year; },
  getMonth: function () { return this.month; },
  getYear: function () { return this.year; },
  getHours: function () {
    return this.hours;
  },
  getMilliseconds: function () {
    return this.milliseconds;
  },
  getMinutes: function () {
    return this.minutes;
  },
  getSeconds: function () {
    return this.seconds;
  },
  getTime: function () {
    var dt = Date.UTC(this.year, this.month, this.date,
      this.hours, this.minutes, this.seconds, this.milliseconds);
    return dt + (this.getTimezoneOffset()*60*1000);
  },
  getTimezone: function () {
    return this.timezone;
  },
  getTimezoneOffset: function () {
    var info = this.getTimezoneInfo();
    return info.tzOffset;
  },
  getTimezoneAbbreviation: function () {
    var info = this.getTimezoneInfo();
    return info.tzAbbr;
  },
  getTimezoneInfo: function () {
    var res;
    if (this.utc) {
      res = { tzOffset: 0,
        tzAbbr: 'UTC' };
    }
    else {
      if (this._useCache) {
        res = this._tzInfo;
      }
      else {
        if (this.timezone) {
          var dt = new Date(Date.UTC(this.year, this.month, this.date,
            this.hours, this.minutes, this.seconds, this.milliseconds));
          var tz = this.timezone;
          res = timezoneJS.timezone.getTzInfo(dt, tz);
        }
        // Floating -- use local offset
        else {
          res = { tzOffset: this.getLocalOffset(),
            tzAbbr: null };
        }
        this._tzInfo = res;
        this._useCache = true;
      }
    }
    return res;
  },
  getUTCDate: function () {
    return this.getUTCDateProxy().getUTCDate();
  },
  getUTCDay: function () {
    return this.getUTCDateProxy().getUTCDay();
  },
  getUTCFullYear: function () {
    return this.getUTCDateProxy().getUTCFullYear();
  },
  getUTCHours: function () {
    return this.getUTCDateProxy().getUTCHours();
  },
  getUTCMilliseconds: function () {
    return this.getUTCDateProxy().getUTCMilliseconds();
  },
  getUTCMinutes: function () {
    return this.getUTCDateProxy().getUTCMinutes();
  },
  getUTCMonth: function () {
    return this.getUTCDateProxy().getUTCMonth();
  },
  getUTCSeconds: function () {
    return this.getUTCDateProxy().getUTCSeconds();
  },
  setDate: function (n) {
    this.setAttribute('date', n);
  },
  setFullYear: function (n) {
    this.setAttribute('year', n);
  },
  setMonth: function (n) {
    this.setAttribute('month', n);
  },
  setYear: function (n) {
    this.setUTCAttribute('year', n);
  },
  setHours: function (n) {
    this.setAttribute('hours', n);
  },
  setMilliseconds: function (n) {
    this.setAttribute('milliseconds', n);
  },
  setMinutes: function (n) {
    this.setAttribute('minutes', n);
  },
  setSeconds: function (n) {
    this.setAttribute('seconds', n);
  },
  setTime: function (n) {
    if (isNaN(n)) { throw new Error('Units must be a number.'); }
    var dt = new Date(0);
    dt.setUTCMilliseconds(n - (this.getTimezoneOffset()*60*1000));
    this.setFromDateObjProxy(dt, true);
  },
  setUTCDate: function (n) {
    this.setUTCAttribute('date', n);
  },
  setUTCFullYear: function (n) {
    this.setUTCAttribute('year', n);
  },
  setUTCHours: function (n) {
    this.setUTCAttribute('hours', n);
  },
  setUTCMilliseconds: function (n) {
    this.setUTCAttribute('milliseconds', n);
  },
  setUTCMinutes: function (n) {
    this.setUTCAttribute('minutes', n);
  },
  setUTCMonth: function (n) {
    this.setUTCAttribute('month', n);
  },
  setUTCSeconds: function (n) {
    this.setUTCAttribute('seconds', n);
  },
  toGMTString: function () {},
  toLocaleString: function () {},
  toLocaleDateString: function () {},
  toLocaleTimeString: function () {},
  toSource: function () {},
  toString: function () {
    // Get a quick looky at what's in there
    var str = this.getFullYear() + '-' + (this.getMonth()+1) + '-' + this.getDate();
    var hou = this.getHours() || 12;
    hou = String(hou);
    var min = String(this.getMinutes());
    if (min.length == 1) { min = '0' + min; }
    var sec = String(this.getSeconds());
    if (sec.length == 1) { sec = '0' + sec; }
    str += ' ' + hou;
    str += ':' + min;
    str += ':' + sec;
    return str;
  },
  toUTCString: function () {},
  valueOf: function () {
    return this.getTime();
  },
  clone: function () {
    return new timezoneJS.Date(this.year, this.month, this.date,
      this.hours, this.minutes, this.seconds, this.milliseconds,
      this.timezone);
  },
  setFromDateObjProxy: function (dt, fromUTC) {
    this.year = fromUTC ? dt.getUTCFullYear() : dt.getFullYear();
    this.month = fromUTC ? dt.getUTCMonth() : dt.getMonth();
    this.date = fromUTC ? dt.getUTCDate() : dt.getDate();
    this.hours = fromUTC ? dt.getUTCHours() : dt.getHours();
    this.minutes = fromUTC ? dt.getUTCMinutes() : dt.getMinutes();
    this.seconds = fromUTC ? dt.getUTCSeconds() : dt.getSeconds();
    this.milliseconds = fromUTC ? dt.getUTCMilliseconds() : dt.getMilliseconds();
    this._day = fromUTC ? dt.getUTCDay() : dt.getDay();
    this._useCache = false;
  },
  getUTCDateProxy: function () {
    var dt = new Date(Date.UTC(this.year, this.month, this.date,
      this.hours, this.minutes, this.seconds, this.milliseconds));
    dt.setUTCMinutes(dt.getUTCMinutes() + this.getTimezoneOffset());
    return dt;
  },
  setAttribute: function (unit, n) {
    if (isNaN(n)) { throw new Error('Units must be a number.'); }
    var dt = new Date(this.year, this.month, this.date,
      this.hours, this.minutes, this.seconds, this.milliseconds);
    var meth = unit == 'year' ? 'FullYear' : unit.substr(0, 1).toUpperCase() +
      unit.substr(1);
    dt['set' + meth](n);
    this.setFromDateObjProxy(dt);
  },
  setUTCAttribute: function (unit, n) {
    if (isNaN(n)) { throw new Error('Units must be a number.'); }
    var meth = unit == 'year' ? 'FullYear' : unit.substr(0, 1).toUpperCase() +
      unit.substr(1);
    var dt = this.getUTCDateProxy();
    dt['setUTC' + meth](n);
    dt.setUTCMinutes(dt.getUTCMinutes() - this.getTimezoneOffset());
    this.setFromDateObjProxy(dt, true);
  },
  setTimezone: function (tz) {
    if (tz == 'Etc/UTC' || tz == 'Etc/GMT') {
      this.utc = true;
    }
    this.timezone = tz;
    this._useCache = false;
  },
  removeTimezone: function () {
    this.utc = false;
    this.timezone = null;
    this._useCache = false;
  },
  civilToJulianDayNumber: function (y, m, d) {
    var a;
    // Adjust for zero-based JS-style array
    m++;
    if (m > 12) {
      a = parseInt(m/12, 10);
      m = m % 12;
      y += a;
    }
    if (m <= 2) {
      y -= 1;
      m += 12;
    }
    a = Math.floor(y / 100);
    var b = 2 - a + Math.floor(a / 4);
    jDt = Math.floor(365.25 * (y + 4716)) +
      Math.floor(30.6001 * (m + 1)) +
      d + b - 1524;
    return jDt;
  },
  getLocalOffset: function () {
    var dt = this;
    var d = new Date(dt.getYear(), dt.getMonth(), dt.getDate(),
      dt.getHours(), dt.getMinutes(), dt.getSeconds());
    return d.getTimezoneOffset();
  }
};


timezoneJS.timezone = new function() {
  var _this = this;
  var monthMap = { 'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3,'may': 4, 'jun': 5,
    'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11 };
  var dayMap = {'sun': 0,'mon' :1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6 };
  var regionMap = {'EST':'northamerica','MST':'northamerica','HST':'northamerica','EST5EDT':'northamerica','CST6CDT':'northamerica','MST7MDT':'northamerica','PST8PDT':'northamerica','America':'northamerica','Pacific':'australasia','Atlantic':'europe','Africa':'africa','Indian':'africa','Antarctica':'antarctica','Asia':'asia','Australia':'australasia','Europe':'europe','WET':'europe','CET':'europe','MET':'europe','EET':'europe'};
  var regionExceptions = {'Pacific/Honolulu':'northamerica','Atlantic/Bermuda':'northamerica','Atlantic/Cape_Verde':'africa','Atlantic/St_Helena':'africa','Indian/Kerguelen':'antarctica','Indian/Chagos':'asia','Indian/Maldives':'asia','Indian/Christmas':'australasia','Indian/Cocos':'australasia','America/Danmarkshavn':'europe','America/Scoresbysund':'europe','America/Godthab':'europe','America/Thule':'europe','Asia/Yekaterinburg':'europe','Asia/Omsk':'europe','Asia/Novosibirsk':'europe','Asia/Krasnoyarsk':'europe','Asia/Irkutsk':'europe','Asia/Yakutsk':'europe','Asia/Vladivostok':'europe','Asia/Sakhalin':'europe','Asia/Magadan':'europe','Asia/Kamchatka':'europe','Asia/Anadyr':'europe','Africa/Ceuta':'europe','America/Argentina/Buenos_Aires':'southamerica','America/Argentina/Cordoba':'southamerica','America/Argentina/Tucuman':'southamerica','America/Argentina/La_Rioja':'southamerica','America/Argentina/San_Juan':'southamerica','America/Argentina/Jujuy':'southamerica','America/Argentina/Catamarca':'southamerica','America/Argentina/Mendoza':'southamerica','America/Argentina/Rio_Gallegos':'southamerica','America/Argentina/Ushuaia':'southamerica','America/Aruba':'southamerica','America/La_Paz':'southamerica','America/Noronha':'southamerica','America/Belem':'southamerica','America/Fortaleza':'southamerica','America/Recife':'southamerica','America/Araguaina':'southamerica','America/Maceio':'southamerica','America/Bahia':'southamerica','America/Sao_Paulo':'southamerica','America/Campo_Grande':'southamerica','America/Cuiaba':'southamerica','America/Porto_Velho':'southamerica','America/Boa_Vista':'southamerica','America/Manaus':'southamerica','America/Eirunepe':'southamerica','America/Rio_Branco':'southamerica','America/Santiago':'southamerica','Pacific/Easter':'southamerica','America/Bogota':'southamerica','America/Curacao':'southamerica','America/Guayaquil':'southamerica','Pacific/Galapagos':'southamerica','Atlantic/Stanley':'southamerica','America/Cayenne':'southamerica','America/Guyana':'southamerica','America/Asuncion':'southamerica','America/Lima':'southamerica','Atlantic/South_Georgia':'southamerica','America/Paramaribo':'southamerica','America/Port_of_Spain':'southamerica','America/Montevideo':'southamerica','America/Caracas':'southamerica'};

  function invalidTZError(t) {
    throw new Error('Timezone "' + t + '" is either incorrect, or not loaded in the timezone registry.');
  }

  function builtInLoadZoneFile(fileName, opts) {
        var ajaxRequest = {
            url: _this.zoneFileBasePath + '/' + fileName,
            async: !!opts.async,
            dataType: "text",
            done: false,
            success: function (str) {
                if (_this.parseZones(str)) {
                    if (typeof opts.callback == 'function') {
                        opts.callback();
                    }
                }
                this.done = true;
            },
            error: function () {
                throw new Error('Error retrieving "' + url + '" zoneinfo file.');
            }
        };
        var res = $.ajax(ajaxRequest);
        return ajaxRequest.done;
  }
  function getRegionForTimezone(tz) {
    var exc = regionExceptions[tz];
    var ret;
    if (exc) {
      return exc;
    }
    else {
      reg = tz.split('/')[0];
      ret = regionMap[reg];
      // If there's nothing listed in the main regions for
      // this TZ, check the 'backward' links
      if (!ret) {
        var link = _this.zones[tz];
        if (typeof link == 'string') {
          return getRegionForTimezone(link);
        }
        else {
          // Backward-compat file hasn't loaded yet, try looking in there
          if (!_this.loadedZones.backward) {
            // This is for obvious legacy zones (e.g., Iceland) that
            // don't even have a prefix like "America/" that look like
            // normal zones
            var parsed = _this.loadZoneFile('backward', true);
            return getRegionForTimezone(tz);
          }
          else {
            invalidTZError(tz);
          }
        }
      }
      return ret;
    }
  }
  function parseTimeString(str) {
    var pat = /(\d+)(?::0*(\d*))?(?::0*(\d*))?([wsugz])?$/;
    var hms = str.match(pat);
    hms[1] = parseInt(hms[1], 10);
    hms[2] = hms[2] ? parseInt(hms[2], 10) : 0;
    hms[3] = hms[3] ? parseInt(hms[3], 10) : 0;
    return hms;
  }
  function getZone(dt, tz) {
    var t = tz;
    var zoneList = _this.zones[t];
    // Follow links to get to an acutal zone
    while (typeof zoneList == "string") {
      t = zoneList;
      zoneList = _this.zones[t];
    }
    if (!zoneList) {
      // Backward-compat file hasn't loaded yet, try looking in there
      if (!_this.loadedZones.backward) {
        // This is for backward entries like "America/Fort_Wayne" that
        // getRegionForTimezone *thinks* it has a region file and zone
        // for (e.g., America => 'northamerica'), but in reality it's a
        // legacy zone we need the backward file for
        var parsed = _this.loadZoneFile('backward', true);
        return getZone(dt, tz);
      }
      invalidTZError(t);
    }
    for(var i = 0; i < zoneList.length; i++) {
      var z = zoneList[i];
      if (!z[3]) { break; }
      var yea = parseInt(z[3], 10);
      var mon = 11;
      var dat = 31;
      if (z[4]) {
        mon = monthMap[z[4].substr(0, 3).toLowerCase()];
        dat = parseInt(z[5], 10);
      }
      var t = z[6] ? z[6] : '23:59:59';
      t = parseTimeString(t);
      var d = Date.UTC(yea, mon, dat, t[1], t[2], t[3]);
      if (dt.getTime() < d) { break; }
    }
    if (i == zoneList.length) { throw new Error('No Zone found for "' + timezone + '" on ' + dt); }
    return zoneList[i];

  }
  function getBasicOffset(z) {
    var off = parseTimeString(z[0]);
    var adj = z[0].indexOf('-') == 0 ? -1 : 1
    off = adj * (((off[1] * 60 + off[2]) *60 + off[3]) * 1000);
    return -off/60/1000;
  }

  // if isUTC is true, date is given in UTC, otherwise it's given
  // in local time (ie. date.getUTC*() returns local time components)
  function getRule( date, zone, isUTC ) {
    var ruleset = zone[1];
    var basicOffset = getBasicOffset( zone );

    // Convert a date to UTC. Depending on the 'type' parameter, the date
    // parameter may be:
    // 'u', 'g', 'z': already UTC (no adjustment)
    // 's': standard time (adjust for time zone offset but not for DST)
    // 'w': wall clock time (adjust for both time zone and DST offset)
    //
    // DST adjustment is done using the rule given as third argument
    var convertDateToUTC = function( date, type, rule ) {
      var offset = 0;

      if(type == 'u' || type == 'g' || type == 'z') { // UTC
          offset = 0;
      } else if(type == 's') { // Standard Time
          offset = basicOffset;
      } else if(type == 'w' || !type ) { // Wall Clock Time
          offset = getAdjustedOffset(basicOffset,rule);
      } else {
          throw("unknown type "+type);
      }
      offset *= 60*1000; // to millis

      return new Date( date.getTime() + offset );
    }

    // Step 1:  Find applicable rules for this year.
    // Step 2:  Sort the rules by effective date.
    // Step 3:  Check requested date to see if a rule has yet taken effect this year.  If not,
    // Step 4:  Get the rules for the previous year.  If there isn't an applicable rule for last year, then
    //      there probably is no current time offset since they seem to explicitly turn off the offset
    //      when someone stops observing DST.
    //      FIXME if this is not the case and we'll walk all the way back (ugh).
    // Step 5:  Sort the rules by effective date.
    // Step 6:  Apply the most recent rule before the current time.

    var convertRuleToExactDateAndTime = function( yearAndRule, prevRule )
    {
      var year = yearAndRule[0];
      var rule = yearAndRule[1];

      // Assume that the rule applies to the year of the given date.
      var months = {
        "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
        "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
      };

      var days = {
        "sun": 0, "mon": 1, "tue": 2, "wed": 3, "thu": 4, "fri": 5, "sat": 6
      }

      var hms = parseTimeString( rule[ 5 ] );
      var effectiveDate;

      if ( !isNaN( rule[ 4 ] ) ) // If we have a specific date, use that!
      {
        effectiveDate = new Date( Date.UTC( year, months[ rule[ 3 ] ], rule[ 4 ], hms[ 1 ], hms[ 2 ], hms[ 3 ], 0 ) );
      }
      else // Let's hunt for the date.
      {
        var targetDay,
          operator;

        if ( rule[ 4 ].substr( 0, 4 ) === "last" ) // Example: lastThu
        {
          // Start at the last day of the month and work backward.
          effectiveDate = new Date( Date.UTC( year, months[ rule[ 3 ] ] + 1, 1, hms[ 1 ] - 24, hms[ 2 ], hms[ 3 ], 0 ) );
          targetDay = days[ rule[ 4 ].substr( 4, 3 ).toLowerCase( ) ];
          operator = "<=";
        }
        else // Example: Sun>=15
        {
          // Start at the specified date.
          effectiveDate = new Date( Date.UTC( year, months[ rule[ 3 ] ], rule[ 4 ].substr( 5 ), hms[ 1 ], hms[ 2 ], hms[ 3 ], 0 ) );
          targetDay = days[ rule[ 4 ].substr( 0, 3 ).toLowerCase( ) ];
          operator = rule[ 4 ].substr( 3, 2 );
        }

        var ourDay = effectiveDate.getUTCDay( );

        if ( operator === ">=" ) // Go forwards.
        {
          effectiveDate.setUTCDate( effectiveDate.getUTCDate( ) + ( targetDay - ourDay + ( ( targetDay < ourDay ) ? 7 : 0 ) ) );
        }
        else // Go backwards.  Looking for the last of a certain day, or operator is "<=" (less likely).
        {
          effectiveDate.setUTCDate( effectiveDate.getUTCDate( ) + ( targetDay - ourDay - ( ( targetDay > ourDay ) ? 7 : 0 ) ) );
        }
      }

      // if previous rule is given, correct for the fact that the starting time of the current
      // rule may be specified in local time
      if(prevRule) {
        effectiveDate = convertDateToUTC(effectiveDate, hms[4], prevRule);
      }

      return effectiveDate;
    }

    var indexOf = function(array, what, startAt) {
      if(array.indexOf) {
        return array.indexOf(what,startAt);
      }
      for (var i = (startAt || 0); i < array.length; i++) {
        if (array[i] == what) {
          return i;
        }
      }
      return -1;
    };

    var findApplicableRules = function( year, ruleset )
    {
      var applicableRules = [];

      for ( var i in ruleset )
      {
        if ( Number( ruleset[ i ][ 0 ] ) <= year ) // Exclude future rules.
        {
          if (
            Number( ruleset[ i ][ 1 ] ) >= year                                            // Date is in a set range.
            || ( Number( ruleset[ i ][ 0 ] ) === year && ruleset[ i ][ 1 ] === "only" )    // Date is in an "only" year.
            || ruleset[ i ][ 1 ] === "max"                                                 // We're in a range from the start year to infinity.
          )
          {
            // It's completely okay to have any number of matches here.
            // Normally we should only see two, but that doesn't preclude other numbers of matches.
            // These matches are applicable to this year.
            applicableRules.push( [year, ruleset[ i ]] );
          }
        }
      }

      return applicableRules;
    }

    var compareDates = function( a, b, prev )
    {
      if ( a.constructor !== Date ) {
        a = convertRuleToExactDateAndTime( a, prev );
      } else if(prev) {
        a = convertDateToUTC(a, isUTC?'u':'w', prev);
      }
      if ( b.constructor !== Date ) {
        b = convertRuleToExactDateAndTime( b, prev );
      } else if(prev) {
        b = convertDateToUTC(b, isUTC?'u':'w', prev);
      }

      a = Number( a );
      b = Number( b );

      return a - b;
    }

    var year = date.getUTCFullYear( );
    var applicableRules;

    applicableRules = findApplicableRules( year, _this.rules[ ruleset ] );
    applicableRules.push( date );
    // While sorting, the time zone in which the rule starting time is specified
    // is ignored. This is ok as long as the timespan between two DST changes is
    // larger than the DST offset, which is probably always true.
    // As the given date may indeed be close to a DST change, it may get sorted
    // to a wrong position (off by one), which is corrected below.
    applicableRules.sort( compareDates );

    if ( indexOf(applicableRules, date ) < 2 ) { // If there are not enough past DST rules...
      applicableRules = applicableRules.concat(findApplicableRules( year-1, _this.rules[ ruleset ] ));
      applicableRules.sort( compareDates );
    }

    var pinpoint = indexOf(applicableRules, date);
    if ( pinpoint > 1 && compareDates( date, applicableRules[pinpoint-1], applicableRules[pinpoint-2][1] ) < 0 ) {
      // the previous rule does not really apply, take the one before that
      return applicableRules[ pinpoint - 2 ][1];
    } else if ( pinpoint > 0 && pinpoint < applicableRules.length - 1 && compareDates( date, applicableRules[pinpoint+1], applicableRules[pinpoint-1][1] ) > 0) {
      // the next rule does already apply, take that one
      return applicableRules[ pinpoint + 1 ][1];
    } else if ( pinpoint === 0 ) {
      // no applicable rule found in this and in previous year
      return null;
    } else {
      return applicableRules[ pinpoint - 1 ][1];
    }
  }
  function getAdjustedOffset(off, rule) {
    var save = rule[6];
    var t = parseTimeString(save);
    var adj = save.indexOf('-') == 0 ? -1 : 1;
    var ret = (adj*(((t[1] *60 + t[2]) * 60 + t[3]) * 1000));
    ret = ret/60/1000;
    ret -= off
    ret = -Math.ceil(ret);
    return ret;
  }
  function getAbbreviation(zone, rule) {
    var res;
    var base = zone[2];
    if (base.indexOf('%s') > -1) {
      var repl;
      if (rule) {
        repl = rule[7]=='-'?'':rule[7];
      }
      // FIXME: Right now just falling back to Standard --
      // apparently ought to use the last valid rule,
      // although in practice that always ought to be Standard
      else {
        repl = 'S';
      }
      res = base.replace('%s', repl);
    }
    else if (base.indexOf('/') > -1) {
      // chose one of two alternative strings
      var t = parseTimeString(rule[6]);
      var isDst = (t[1])||(t[2])||(t[3]);
      res = base.split("/",2)[isDst?1:0];
    } else {
      res = base;
    }
    return res;
  }

  this.zoneFileBasePath;
  this.zoneFiles = ['africa', 'antarctica', 'asia',
    'australasia', 'backward', 'etcetera', 'europe',
    'northamerica', 'pacificnew', 'southamerica'];
  this.loadingSchemes = {
    PRELOAD_ALL: 'preloadAll',
    LAZY_LOAD: 'lazyLoad',
    MANUAL_LOAD: 'manualLoad'
  }
  this.loadingScheme = this.loadingSchemes.LAZY_LOAD;
  this.defaultZoneFile =
    this.loadingScheme == this.loadingSchemes.PRELOAD_ALL ?
      this.zoneFiles : 'northamerica';
  this.loadedZones = {};
  this.zones = {};
  this.rules = {};

  this.init = function (o) {
    var opts = { async: true };
    var sync = false;
    var def = this.defaultZoneFile;
    var parsed;
    // Override default with any passed-in opts
    for (var p in o) {
      opts[p] = o[p];
    }
    if (typeof def == 'string') {
      parsed = this.loadZoneFile(def, opts);
    }
    else {
      if (opts.callback) {
        throw new Error('Async load with callback is not supported for multiple default zonefiles.');
      }
      for (var i = 0; i < def.length; i++) {
        parsed = this.loadZoneFile(def[i], opts);
      }
    }
  };
  // Get the zone files via XHR -- if the sync flag
  // is set to true, it's being called by the lazy-loading
  // mechanism, so the result needs to be returned inline
  this.loadZoneFile = function (fileName, opts) {
    if (typeof this.zoneFileBasePath == 'undefined') {
      throw new Error('Please define a base path to your zone file directory -- timezoneJS.timezone.zoneFileBasePath.');
    }
    // ========================
    // Define your own transport mechanism here
    // and comment out the default below
    // ========================
      var parsed = builtInLoadZoneFile(fileName, opts);
      this.loadedZones[fileName] = parsed;
      return parsed;
  };
  this.loadZoneJSONData = function (url, sync) {
    var processData = function (data) {
      data = eval('('+ data +')');
      for (var z in data.zones) {
        _this.zones[z] = data.zones[z];
      }
      for (var r in data.rules) {
        _this.rules[r] = data.rules[r];
      }
    }
    if (sync) {
      var data = fleegix.xhr.doGet(url);
      processData(data);
    }
    else {
      fleegix.xhr.doGet(processData, url);
    }
  };
  this.loadZoneDataFromObject = function (data) {
    if (!data) { return; }
    for (var z in data.zones) {
      _this.zones[z] = data.zones[z];
    }
    for (var r in data.rules) {
      _this.rules[r] = data.rules[r];
    }
  };
  this.getAllZones = function() {
    var arr = [];
    for (z in this.zones) { arr.push(z); }
    return arr.sort();
  };
  this.parseZones = function(str) {
    var s = '';
    var lines = str.split('\n');
    var arr = [];
    var chunk = '';
    var zone = null;
    var rule = null;
    for (var i = 0; i < lines.length; i++) {
      l = lines[i];
      if (l.match(/^\s/)) {
        l = "Zone " + zone + l;
      }
      l = l.split("#")[0];
      if (l.length > 3) {
        arr = l.split(/\s+/);
        chunk = arr.shift();
        switch(chunk) {
          case 'Zone':
            zone = arr.shift();
            if (!_this.zones[zone]) { _this.zones[zone] = [] }
            _this.zones[zone].push(arr);
            break;
          case 'Rule':
            rule = arr.shift();
            if (!_this.rules[rule]) { _this.rules[rule] = [] }
            _this.rules[rule].push(arr);
            break;
          case 'Link':
            // No zones for these should already exist
            if (_this.zones[arr[1]]) {
              throw new Error('Error with Link ' + arr[1]);
            }
            // Create the link
            _this.zones[arr[1]] = arr[0];
            break;
          case 'Leap':
            break;
          default:
            // Fail silently
            break;
        }
      }
    }
    return true;
  };
  this.getTzInfo = function(dt, tz, isUTC) {
    // Lazy-load any zones not yet loaded
    if (this.loadingScheme == this.loadingSchemes.LAZY_LOAD) {
      // Get the correct region for the zone
      var zoneFile = getRegionForTimezone(tz);
      if (!zoneFile) {
        throw new Error('Not a valid timezone ID.');
      }
      else {
        if (!this.loadedZones[zoneFile]) {
          // Get the file and parse it -- use synchronous XHR
          var parsed = this.loadZoneFile(zoneFile, true);
        }
      }
    }
    var zone = getZone(dt, tz);
    var off = getBasicOffset(zone);
    // See if the offset needs adjustment
    var rule = getRule(dt, zone, isUTC);
    if (rule) {
      off = getAdjustedOffset(off, rule);
    }
    var abbr = getAbbreviation(zone, rule);
    return { tzOffset: off, tzAbbr: abbr };
  }
}


