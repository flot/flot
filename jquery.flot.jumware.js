/*
 * The MIT License

Copyright (c) 2010,2011,2012 by Juergen Marsch

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
export function createCandlestick(data)
{ var start = [], end = [], min = [], max = [];
  for(var i = 0; i < data.length; i++){
    start.push([data[i][0],data[i][1]]);
    end.push([data[i][0],data[i][2]]);
    min.push([data[i][0],data[i][3]]);
    max.push([data[i][0],data[i][4]]);
  }
  var r = [ { label: "Start", data: start }
          , { label: "End", data: end }
          , { label: "Max", data: max}
          , { label: "Min", data: min}
        ];
  return r;
}
export function createQuartile(data, index, indexName)
{ var q0 = [], q1 = [],q2 = [],q3 = [],q4 = [], v = [], i1, i2, i3, i4, p;
  i1 = (0.25 * data.length).toFixed(0); i2 = (0.5 * data.length).toFixed(0);
  i3 = (0.75 * data.length).toFixed(0); i4 = data.length - 1;
  for (var j = 0; j < data[0].length; j++)
  { p = [];
    for (var i = 0; i < data.length; i++) { p.push(data[i][j]); }
    p.sort(function(a,b){return a - b} );
    q1.push([j,p[i1]]); q2.push([j,p[i2]]); q3.push([j,p[i3]]); q4.push([j,p[i4]]);
    q0.push([j,p[0]]); v.push([j,data[index][j]]);
  }
  var r = [ { data: q4}, { data: q3}, { data: q2}, { data: q1}, {data: q0, color: "#ffffff" }
          , {label: indexName, points: {show:true}, lines: { fill: null, steps: false}, data: v}];
  return r;
}
export function createPercentile(data, index, indexName, percentiles)
{ var percentile = [], zeroline = [], val = [], indexes = [], p;
  if(percentiles.length)
  { indexes.push([0]);
    percentile.push([]);
    for(var j = 0;j < percentiles.length;j++)
    { indexes.push(parseInt(data.length * percentiles[j]));
      percentile.push([]);
    }
    indexes.push(data.length - 1);
  }
  else
  { for(var j = 0;j < percentiles; j++)
    { indexes.push(parseInt(data.length / percentiles * j));
      percentile.push([]);
    }
    indexes.push(data.length - 1);
  }
  percentile.push([]);
  for(var j = 0; j < data[0].length; j++)
  { p = [];
    for(var i = 0; i < data.length; i++){ p.push(data[i][j]); }
    p.sort(function(a,b){return a-b});
    for(var i = 0; i < percentile.length; i++ ) { percentile[i].push([j,p[indexes[i]]]); }
    val.push([j,data[index][j]]);
  }
  var r = [];
  for(var i = percentile.length - 1; i > 0 ; i--){ r.push({ data: percentile[i] });}
  r.push({data: percentile[0], color:"#ffffff"});
  r.push({label: indexName, points: {show: true}, lines: { fill: null, steps: false}, data:val});
  return r;
}
export function createSimiliarity(data1, data2, mode)
{ var r = [];
  var d1 = normalize(data1);
  var d2 = normalize(data2);
  var d;
  for (var i = 0; i < d1.length; i++)
  { switch (mode)
        { case "diff":
                d = d1[i][1] - d2[i][1];
                break;
          case "abs":
                d = Math.abs(d1[i][1] - d2[i][1]);
                break;
          default:
            d = 0;
        }
        r.push([d1[i][0],d]);
  }
  return r;
}
export function normalize(data)
{ var minmax, d;var r = [];
  minmax = getMinMax(data);
  for(var i = 0; i < data.length; i++)
  { d = (data[i][1] - minmax.min) / minmax.diff * 100;
        r.push([data[i][0],d]);
  }
  return r;
}
export function getMinMax(data)
{ var mn,mx,df;
  mn = Number.POSITIVE_INFINITY;
  mx = Number.NEGATIVE_INFINITY;
  for (var i = 0; i < data.length; i++)
  { mn = Math.min(mn, data[i][1]);
        mx = Math.max(mx, data[i][1]);
  }
  df = mx - mn;
  return {min: mn, max: mx, diff: df};
}
export function combineData(data,ticks)
{ var r = [];
  for(var i = 0; i < data.length; i++)
  { var s = [];
    for(var j = 0; j < data[i].length; j++)
        { var d = [ ticks[j], data[i][j] ];
          s.push(d);
        }
        r.push(s);
  }
  return r;
}
