cd static/framework

sed -i 's/,production/,development/g' med_list/index.html
sed -i 's/,production/,development/g' problem_list/index.html
sed -i 's/,production/,development/g' api_playground/index.html
sed -i 's/,production/,development/g' med_adherence/index.html

