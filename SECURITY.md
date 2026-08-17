# Security Policy

## Supported versions

Only the latest published minor line receives routine security fixes while the
project is in `0.x`. Once `1.0` is released, the latest `1.x` minor is the
primary supported line; older lines are maintained only when a release note
explicitly says so.

WeBaseUI is a client-side component library. Reports about an application that
uses WeBaseUI should include the application repository and the smallest
reproduction, but must not include secrets or personal data.

## Reporting a vulnerability

Please use GitHub's private vulnerability reporting channel:

<https://github.com/WeOpen/WeBaseUI/security/advisories/new>

Do not open a public issue for an undisclosed vulnerability. Include the
affected package and version, impact, reproduction or proof of concept, and any
known workaround. If private reporting is unavailable, contact the repository
maintainers through the GitHub organization and request a private channel.

Maintainers will acknowledge a report within five business days, assess
severity and affected versions, and coordinate a fix or mitigation. Timelines
can change when the report requires upstream browser, Svelte, or dependency
coordination. Credit is offered in the release note unless the reporter asks to
remain anonymous.
