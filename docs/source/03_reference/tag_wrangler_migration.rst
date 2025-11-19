Tag Wrangler Migration
======================

This module is based on the original **Tag Wrangler** plugin by PJ Eby (ISC License).
The codebase has been refactored to TypeScript and integrated into the ptune-log project.

Migration Notes
----------------

- Original plugin’s patch and command registration code were removed.
- Functionality is reimplemented in TypeScript under `src/providers/tag_wrangler`.
- YAML parsing replaced with Obsidian's native `parseYaml()` API.
- Compatible with ptune-log’s TagAliases and LLM tag modules.

Tag Wrangler License
--------------------

This code includes modifications of Tag Wrangler (PJ Eby, 2021, ISC License).

::

    Copyright 2021 PJ Eby

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted, provided that the above
    copyright notice and this permission notice appear in all copies.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
    WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
    MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
    ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
    WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
    ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
    OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
