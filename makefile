clean:
	@# prevent duplicates in the final bundle
	-rm -rf Unsplash\ Wallpaper.app Unsplash\ Wallpaper.zip

build: clean
	node ./node_modules/electron-packager/cli.js \
		. \
		Unsplash\ Wallpaper \
		--platform=darwin \
		--arch=x64 \
		--version=0.36.3 \
		--icon=images/Icon.icns \
		--ignore="node-modules/(electron-packager|electron-prebuilt|publish-release)" \
		--prune
	mv Unsplash\ Wallpaper-darwin-x64/Unsplash\ Wallpaper.app Unsplash\ Wallpaper.app
	rm -rf Unsplash\ Wallpaper-darwin-x64

publish: clean build
	@# ditto creates a much better compressed zip file compared to the zip command
	@# these flags come from ditto's man page on how to create an archive in the
	@# same manner as Finder's compress option
	ditto -c -k --sequesterRsrc --keepParent Unsplash\ Wallpaper.app Unsplash\ Wallpaper.zip
	./node_modules/publish-release/bin/publish-release \
		--template notes.md \
		--assets Unsplash\ Wallpaper.zip

all: clean build publish
.PHONY: all
