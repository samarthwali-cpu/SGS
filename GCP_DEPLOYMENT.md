# Deploy SGS AI Technology to Google Cloud

This guide covers two Google Cloud deployment options for the current static website. **Firebase Hosting** is the simplest and recommended route for a static site, with a global CDN, HTTPS, and preview channels. If you specifically need a container, use the included Docker image and deploy it to **Cloud Run**. Cloud Run runs a small Nginx web server in a container and provides a managed HTTPS endpoint.

## What this deploys

The site is plain HTML, CSS, and JavaScript. There is no framework build command or backend to deploy. Firebase Hosting will publish the website files from this project:

- `index.html` — page content and metadata
- `styles.css` — responsive styling
- `script.js` — mobile navigation and current-year footer
- `logo/sgsai-logo.png` — supplied SGS AI Technology logo

The site also loads its typefaces from Google Fonts. There are no API keys or server-side secrets in the current frontend. The Docker image uses the unprivileged Nginx image, listens on port 8080, and serves the same files with basic security headers and static-asset caching.

## Container deployment: Google Cloud Run

Choose this route when you need to deliver the website as a Docker container. You need Docker Desktop (or another Docker Engine) running locally and the Google Cloud CLI (`gcloud`) installed. You also need access to the Google Cloud project and permission to create Artifact Registry repositories and Cloud Run services.

### Build and test the container locally

Run these commands from the project root—the folder containing `Dockerfile` and `index.html`:

```sh
docker build -t sgs-ai-website:local .
docker run --rm --name sgs-ai-website -p 8080:8080 sgs-ai-website:local
```

Open <http://localhost:8080> and verify the page, mobile navigation, styles, script, and logo. You can also check that the server responds with:

```sh
curl -I http://localhost:8080/
```

Stop the running container with **Ctrl+C**. The Docker build context excludes Git metadata and documentation, and includes the required site assets and Nginx configuration.

### Publish the image and deploy to Cloud Run

1. In the [Google Cloud Console](https://console.cloud.google.com/), select or create the project to host the site. Record its **Project ID**. Choose a region close to your users and use that same region for Artifact Registry and Cloud Run.
1. Authenticate and set the project. Replace the sample values with your project ID and chosen region (for example, `us-central1`):

  ```sh
  gcloud auth login
  gcloud config set project YOUR_PROJECT_ID
  gcloud services enable run.googleapis.com artifactregistry.googleapis.com
  ```

1. Create a Docker repository in Artifact Registry. This only needs to be done once per project/region:

  ```sh
  gcloud artifacts repositories create sgsai-images \
    --repository-format=docker \
    --location=YOUR_REGION \
    --description="SGS AI website container images"
  ```

1. Configure Docker authentication for that region and build a versioned image. Choose a new tag for each release rather than reusing an existing tag:

  ```sh
  gcloud auth configure-docker YOUR_REGION-docker.pkg.dev
  docker build --platform linux/amd64 \
    -t YOUR_REGION-docker.pkg.dev/YOUR_PROJECT_ID/sgsai-images/sgs-ai-website:v1 .
  ```

1. Push the image to Artifact Registry:

  ```sh
  docker push YOUR_REGION-docker.pkg.dev/YOUR_PROJECT_ID/sgsai-images/sgs-ai-website:v1
  ```

1. Deploy that image as a Cloud Run service:

  ```sh
  gcloud run deploy sgs-ai-website \
    --image YOUR_REGION-docker.pkg.dev/YOUR_PROJECT_ID/sgsai-images/sgs-ai-website:v1 \
    --region YOUR_REGION \
    --port 8080 \
    --allow-unauthenticated
  ```

  The website is intentionally public. `--allow-unauthenticated` permits public visitors; your organization may prohibit public invoker access through policy. If so, coordinate with its administrator and use the approved public-access configuration. Cloud Run prints the HTTPS service URL when deployment completes.

1. Open the service URL and verify the page and assets. Optionally confirm a successful HTTP response with `curl -I YOUR_CLOUD_RUN_URL`. In the Cloud Run console, review the active revision, logs, region, and service settings.

### Updating and rolling back a Cloud Run container

For each website release, build and push a new, unique image tag (for example, `v2`) and deploy that image with the same `gcloud run deploy` command. Cloud Run creates a new revision. To roll back, use **Cloud Run → service → Revisions** in the Google Cloud Console and route traffic back to the known-good revision. Keep the previous image available in Artifact Registry until no longer needed.

Cloud Run is a managed container service and may incur charges based on resource usage and configuration. Review current Cloud Run and Artifact Registry pricing, quotas, and billing alerts for your project. For a static website without container requirements, Firebase Hosting usually has less operational overhead.

## Firebase Hosting deployment (static site)

Use the steps below instead when you prefer the managed static hosting route. No container or build step is needed.

## 1. Create or select a Google Cloud project

1. Open the [Google Cloud Console](https://console.cloud.google.com/) and create a project, or select an existing project that is safe to use for this website.
2. Record its **Project ID** (not just its display name). You will use it in the Firebase CLI commands below.
3. Open the [Firebase Console](https://console.firebase.google.com/) and add Firebase to that same Google Cloud project.
4. In the Firebase project, open **Build → Hosting** and choose **Get started** if prompted.
5. Review the project’s billing plan and current Firebase Hosting quotas in the Firebase Console. A static site can often start on the no-cost plan; confirm current limits and billing requirements for your expected traffic and features.

You need permission to administer Firebase Hosting for the selected project. If an organization manages the project, ask its administrator to grant the required access rather than creating a separate project without approval.

## 2. Install and sign in to the Firebase CLI

Install a current supported Node.js LTS release and npm if they are not already available. Then install the Firebase CLI and authenticate:

```sh
npm install -g firebase-tools
firebase login
firebase projects:list
```

Confirm that the project you prepared appears in `firebase projects:list`. If your organization requires a managed installation method, follow its software-installation policy instead of using a global npm install.

## 3. Add the Hosting configuration

From the project root—the folder containing `index.html`—create `firebase.json` with this configuration:

```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      ".firebaserc",
      "GCP_DEPLOYMENT.md",
      "**/.*",
      "**/node_modules/**"
    ],
    "headers": [
      {
        "source": "**/*.css",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=3600"
          }
        ]
      },
      {
        "source": "**/*.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=3600"
          }
        ]
      },
      {
        "source": "**/*.png",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=86400"
          }
        ]
      }
    ]
  }
}
```

The public directory is the repository root because the site currently has no build output directory. The ignore rules keep Firebase configuration, hidden files, dependencies, and this deployment guide out of the published site. If you rename this guide, update its ignore entry. Do not put credentials, private customer data, or other non-public files in the deployment directory.

The cache rules keep CSS and JavaScript cached for one hour and the logo for one day. If you later add fingerprinted build assets, you can increase their cache duration; avoid long-lived caching for files whose names do not change when their contents change.

## 4. Select the deployment project

Link this local folder to the Google Cloud/Firebase project. Replace the placeholder with the Project ID from step 1:

```sh
firebase use --add
```

Choose the project from the list and give it an alias such as `production`. Alternatively, set the active project explicitly for each command so there is no ambiguity:

```sh
firebase use production
```

Use the alias you chose in the previous step; `firebase use YOUR_PROJECT_ID` also selects a project directly.

Firebase may create or update `.firebaserc` to remember the alias. Keep project configuration in source control if appropriate, but do not commit credentials or access tokens.

## 5. Preview locally

Firebase’s local Hosting emulator lets you check the production-style file layout before publishing:

```sh
firebase emulators:start --only hosting --project YOUR_PROJECT_ID
```

Open the local URL printed by the command. Check the desktop and mobile layouts, menu behavior, section links, footer year, and logo. Verify that the browser can load `styles.css`, `script.js`, and `logo/sgsai-logo.png` without 404 errors. Stop the emulator with **Ctrl+C** when finished.

## 6. Deploy to Hosting

Deploy only the Hosting target, using the exact Project ID:

```sh
firebase deploy --only hosting --project YOUR_PROJECT_ID
```

The CLI prints the Hosting URL when deployment completes, typically an address under `web.app` or `firebaseapp.com`. Open that URL in a private browser window and verify the live site and its assets. A Hosting release is public to anyone who can access its URL unless you configure access controls separately.

For another review before production, publish a temporary preview channel:

```sh
firebase hosting:channel:deploy review --project YOUR_PROJECT_ID
```

The CLI prints a preview URL. Preview channels expire according to Firebase Hosting’s channel settings; they are useful for review, not a permanent production address.

## 7. Connect a custom domain (optional)

1. In the Firebase Console, open **Hosting** for the right project and select **Add custom domain**.
2. Enter the domain or subdomain you want to use, for example `www.example.com`.
3. Follow the verification and DNS instructions Firebase shows for that exact domain. Firebase may request TXT verification records and A/AAAA records; use the current values shown in the console rather than copying records from an example.
4. If the domain is already serving a live website, plan the DNS change to avoid interrupting it. Add verification records first, then switch traffic when ready.
5. Wait for DNS propagation and for Firebase to provision the managed TLS certificate. Keep the DNS records Firebase requires in place.
6. Test the custom domain over HTTPS and confirm that the Hosting dashboard reports it as connected.

Do not remove existing mail-related DNS records (such as MX, SPF, DKIM, or DMARC) while configuring web hosting. DNS propagation time varies by provider and record TTL.

## 8. Optional: deploy automatically from GitHub

For a GitHub repository, the Firebase CLI can configure a workflow to create preview deployments for pull requests and deploy production when changes are merged. From the project root, run:

```sh
firebase init hosting:github
```

Choose the correct repository and production branch, review the workflow files the CLI proposes, and follow the prompts to configure GitHub authentication. Protect the production branch with your normal review and approval rules. Review the generated workflow and repository secrets before enabling it; CI credentials should have only the access they need. After setup, use pull-request preview URLs to review site changes before they reach the live Hosting site.

## Updating the website

1. Edit the website files and test them locally.
2. Review the changes in a Hosting preview channel or GitHub pull request preview. For the container route, rebuild and run the Docker image locally before publishing.
3. Deploy the approved version with `firebase deploy --only hosting --project YOUR_PROJECT_ID` for Firebase Hosting, or build/push a new image tag and deploy it with `gcloud run deploy` for Cloud Run. If GitHub deployment is enabled for Hosting, merge to the configured production branch.
4. Check the published page and browser console after deployment. For Cloud Run, also confirm the new revision is receiving traffic.

There is no `npm run build` step for the current site. If a framework or bundler is introduced later, build its production output and change `hosting.public` to that output directory (often `dist` or `build`) and update the Dockerfile to copy that output rather than the project root.

## Rollback

If a Firebase Hosting release causes a problem, open **Firebase Console → Hosting → Release history**, select the last known-good release, and use the rollback action if available. For Cloud Run, route traffic back to a known-good revision as described above. You can also restore known-good website files from version control and redeploy them. Verify the live URL and assets after rollback.

## Troubleshooting

- **The CLI cannot find the project:** run `firebase projects:list`, check the Project ID, and sign in with an account that has access to that project.
- **Permission denied during deploy:** ask the project administrator to grant the Firebase Hosting deployment permissions required by your organization. Do not work around organization IAM policy by using a personal project.
- **The home page loads but the logo is missing:** confirm the file exists at `logo/sgsai-logo.png` and that the deployed HTML uses the relative path `logo/sgsai-logo.png` with the correct letter case.
- **CSS or JavaScript changes do not appear:** hard-refresh the browser, check the deployed release timestamp, and allow for the one-hour asset cache. For urgent fixes, consider temporarily lowering the CSS/JS cache duration and redeploying.
- **A custom domain is not active:** check the exact DNS records in Firebase Hosting, remove conflicting web-hosting records only when safe, and allow DNS and certificate provisioning to complete.
- **The navigation does not work at the deployed URL:** confirm `script.js` was included in the release and check the browser console for a failed asset request or JavaScript error.
- **Docker is unavailable or the daemon is stopped:** start Docker Desktop (or the configured Docker Engine) and rerun the build.
- **Cloud Run rejects an image or cannot start the container:** build for `linux/amd64`, confirm Nginx listens on port 8080, and check the Cloud Run revision logs for startup errors.
- **Artifact Registry denies a push:** confirm the image URI uses the correct project ID and region, Docker authentication was configured for `YOUR_REGION-docker.pkg.dev`, and your account has permission to upload images.

## Security and operations checklist

- Deploy to the intended Google Cloud project and production Firebase site.
- Keep credentials, private keys, and secret values out of the public website directory and Git history.
- Confirm only public website assets are included in the Hosting release.
- Test the live site over HTTPS, including its logo, CSS, JavaScript, navigation, and contact link.
- Confirm that `hello@sgsaitechnology.com` is the correct public contact address before launch; it is currently a placeholder in the page.
- Monitor Hosting usage and quotas in the Firebase Console as traffic grows.
- Review the hosting configuration and CI permissions whenever the deployment process changes.
