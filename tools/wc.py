#!/usr/bin/python

import fileinput

tree = {}

for line in fileinput.input():
  fields = line.split()
  if len(fields) == 2:
    size, path = fields
    size = int(size)
    parts = path.split('/')
    t = tree
    for part in parts[:-1]:
      t = t.setdefault(part, {})
    t[parts[-1]] = size

def childy(t):
  for k, v in t.items():
    if type(v) == int:
      yield {'caption': k, 'size': v}
    else:
      yield {'caption': k, 'children': list(childy(v))}

def rollup(node):
  if 'children' in node:
    children = node['children']
    for c in children:
      rollup(c)
    children.sort(key=lambda d: d['size'], reverse=True)
    node['size'] = sum(d['size'] for d in children)
  return node

def annotate(t):
  t['caption'] += ' (%dk)' % (t['size'] / 1024)
  if 'children' in t:
    for c in t['children']:
      annotate(c)

tree = {'caption': 'big', 'children': list(childy(tree))}
tree = rollup(tree)
annotate(tree)
print 'var data =', tree, ';'
