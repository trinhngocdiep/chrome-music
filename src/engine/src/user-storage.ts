declare const chrome;
const apiUrl = 'https://api.myjson.com/bins/';
const baseBucketId = '9hoin';
const defaultUserId = 'chrome-music';

export class UserStorage {
  constructor(
    private onReady: (data: any) => void
  ) {
    // this.onReady({ id: defaultUserId });
    this.getUserId(userId => this.loadCloudStorage(userId));
  }

  userBucket;
  private userBucketId;

  sync() {
    if (!this.userBucket || !this.userBucketId) {
      console.debug('cloud storage not available');
      return;
    }
    const url = apiUrl + this.userBucketId;
    http(url, 'PUT', this.userBucket)
      .then(response => {
        console.log('sync response', response);
        if (response.ok) {
          return response.json();
        }
        throw response.statusText;
      });
  }

  private getUserId(callback) {
    if (!chrome || !chrome.identity) {
      callback(defaultUserId);
      return;
    }
    chrome.identity.getProfileUserInfo((userInfo) => callback(userInfo && userInfo.id || defaultUserId));
  }

  private loadCloudStorage(userId) {
    http(apiUrl + baseBucketId)
      .then(response => response.json())
      .then(buckets => {
        let bucketId = buckets[userId];
        if (bucketId) {
          http(apiUrl + bucketId)
            .then(response => {
              if (response.ok) {
                return response.json();
              }
              throw response.statusText;
            })
            .then(data => {
              this.userBucket = data;
              this.userBucketId = bucketId;
              this.onReady(data);
            })
            .catch(error => console.log('error getting buckets for user', bucketId, error));
          return;
        }

        this.userBucket = { id: userId };
        http(apiUrl, 'POST', this.userBucket)
          .then(response => {
            if (response.ok) {
              return response.json();
            }
            throw response.statusText;
          }).then(data => {
            this.userBucketId = data.uri.slice(data.uri.lastIndexOf('/') + 1);
            buckets[userId] = this.userBucketId;
            http(apiUrl + baseBucketId, 'PUT', buckets)
              .then(response => {
                if (response.ok) {
                  return response.json();
                }
                throw response.statusText;
              }).then(_ => this.onReady(this.userBucket));
          });
      });
  }
}

function http(url, method?, body?) {
  const options = {
    method: method || 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : null
  };
  return fetch(url, options);
}