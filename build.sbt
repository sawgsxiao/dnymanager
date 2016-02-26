import com.github.play2war.plugin._

name := "dnymanager"

version := "1.0-SNAPSHOT"

libraryDependencies ++= Seq(
  javaJdbc,
  javaEbean,
  cache,
  "org.apache.poi" % "poi" % "3.8",
  "org.apache.poi" % "poi-ooxml" % "3.9"
)     

libraryDependencies += "mysql" % "mysql-connector-java" % "5.1.18"

play.Project.playJavaSettings

Play2WarPlugin.play2WarSettings

Play2WarKeys.servletVersion := "3.1"