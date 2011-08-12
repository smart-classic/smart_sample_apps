cd static/framework/smart/scripts

echo "// Autogenerated by concantenating several files: " > smart-api-client.js
echo "// DO NOT EDIT. " >> smart-api-client.js
echo "// cat ../../jquery/jquery.js jquery-ui.js  jquery.rdfquery.core-1.0.js jschannel.js smart-api-client-base.js  > smart-api-client.js"  >> smart-api-client.js
cat ../../jquery/jquery.js jquery-ui.js  jquery.rdfquery.core-1.0.js jschannel.js smart-api-client-base.js  >> smart-api-client.js

cd ../..


(./js steal/buildjs med_list/index.html) & \
(./js steal/buildjs problem_list/index.html) & \
(./js steal/buildjs med_calendar/index.html) & \
(./js steal/buildjs api_playground/index.html) & \
(./js steal/buildjs med_adherence/index.html)

wait

sed -i 's/,development/,production/g' problem_list/index.html
sed -i 's/,development/,production/g' med_list/index.html
sed -i 's/,development/,production/g' med_calendar/index.html
sed -i 's/,development/,production/g' api_playground/index.html
sed -i 's/,development/,production/g' med_adherence/index.html
