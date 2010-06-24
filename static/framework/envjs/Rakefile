# Ruby Rake file to allow automatic build testing on RunCodeRun.com

task :default => [:test]

task :test do
  classpath = [
  	File.join(".", "rhino", "ant.jar"), 
  	File.join(".", "rhino", "ant-launcher.jar")
  ].join(File::PATH_SEPARATOR)
  exec "java -cp #{classpath} org.apache.tools.ant.Main -emacs all"
end
