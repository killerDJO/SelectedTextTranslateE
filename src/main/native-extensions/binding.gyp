{
  "targets": [
    {
      "target_name": "native-extensions",
      "include_dirs" : [
        "<!(node -e \"require('nan')\")"
      ],
      "sources": [ "native-extensions.cpp" ],
      "libraries": [ "Winmm.lib" ]
    }
  ]
}