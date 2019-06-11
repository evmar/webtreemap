#!/usr/bin/python
#
# Copyright 2019 Google Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import collections
import csv
import json
import sys

def load():
  states = collections.defaultdict(lambda: {})
  with open(sys.argv[1], encoding='latin-1') as f:
    r = csv.reader(f)
    next(r)  # skip header
    next(r)  # skip header
    for row in r:
      county, state = row[2].split(', ')
      pop = int(row[10])
      states[state][county] = pop
  return states

def rollup(node):
  if 'children' in node:
    children = node['children']
    for c in children:
      rollup(c)
    children.sort(key=lambda d: d['size'], reverse=True)
    node['size'] = sum(d['size'] for d in children)
  return node

states = load()
states = rollup({
  'caption': 'US',
  'children': [{
    'caption': state,
    'children': [{
      'caption': county,
      'size': pop
    } for county, pop in counties.items()]
  } for state, counties in states.items()]
})

print('export default ', end='')
json.dump(states, sys.stdout)
