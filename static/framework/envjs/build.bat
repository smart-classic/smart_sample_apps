del envjs\dist\env.rhino.js
cd envjs
START /WAIT /B ant
:wait
sleep 1
IF NOT EXIST dist\env.rhino.js GOTO wait

cd ..
COPY envjs\dist\env.rhino.js steal\rhino\env.js