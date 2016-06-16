P=/home/remember2015/htdocs/docgen
cp output/output/* doc/API_Doc/
rm -rf doc/API_Doc/tree.js
export LANG='zh_CN.UTF-8'
svn ci -m 'update doc' --username wuliang --password fz7838587@rover2 $P/doc --trust-server-cert --non-interactive
export LANG='zh_CN.GBK'
