plugins {
    id("grid.kotlin")
    application
}

dependencies {
    implementation(project(":grid-kotlin-core"))
    implementation(project(":grid-kotlin-client-okhttp"))
}

application {
    // Use `./gradlew :grid-kotlin-example:run` to run `Main`
    // Use `./gradlew :grid-kotlin-example:run -Pexample=Something` to run `SomethingExample`
    mainClass = "com.grid.api.example.${
        if (project.hasProperty("example"))
            "${project.property("example")}ExampleKt"
        else
            "MainKt"
    }"
}
