// Comment to get more information during initialization
logLevel := Level.Warn

// The Typesafe repository
resolvers += "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/"

// Use the Play sbt plugin for Play projects
addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "2.2.6")

//playplugin repostory
resolvers += "Play2war plugins release" at "http://repository-play-war.forge.cloudbees.com/release/"

//use play2war
addSbtPlugin("com.github.play2war" % "play2-war-plugin" % "1.2")