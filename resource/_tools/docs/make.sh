P=/home/remember2015/htdocs/docgen
#export LANG='zh_CN.UTF-8'
#svn up --username wuliang --password fz7838587@rover2 $P/code/src --trust-server-cert --non-interactive
/usr/java/jre1.6.0_17/bin/java -jar $P/DocGen.jar -p $P/config.xml -o $P/output -t $P/template/ext/template.xml -verbose -c GBK
export LANG='zh_CN.GBK'
/usr/java/jre1.6.0_17/bin/java -cp $P/lib/js.jar org.mozilla.javascript.tools.shell.Main $P/lib/run.js config.json
