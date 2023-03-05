# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2023-03-05
### Changed
- Log simple message when throwing an attack error with Store module.
- Allow store's filename to be case-sensitive with Store module.
- Bump dependencies.

### Fixed
- Throw a SyntaxError when accessing an empty key with Store module.
- Return `undefined` when accessing a key that is not found in readonly mode with Store module.
- Prevent channel parsing error of arguments.

## [1.0.2] - 2022-06-07
### Added
- Encryption / decryption of data in homebrew store module.
- Typescript to demo/package.json. [#1](https://github.com/poirierlouis/electron-bridge/pull/1)
- More descriptive filters for demo/src/dialog.tab.ts. [#1](https://github.com/poirierlouis/electron-bridge/pull/1)
- Changelog.

### Fixed
- Bump dependencies.

## [1.0.1] - 2021-10-03
### Added
- README and LICENSE in deployed packages.

## [1.0.0] - 2021-10-13
### Added
- Packages with `electron-bridge` and `electron-bridge-cli`.

[Unreleased]: https://github.com/poirierlouis/electron-bridge/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/poirierlouis/electron-bridge/compare/v1.0.2...v1.1.0
[1.0.2]: https://github.com/poirierlouis/electron-bridge/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/poirierlouis/electron-bridge/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/poirierlouis/electron-bridge/releases/tag/v1.0.0
