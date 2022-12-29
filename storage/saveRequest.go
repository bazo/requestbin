package storage

import (
	"encoding/json"
	"fmt"
	"net/http"
	"requestbin/helpers"
	"requestbin/types"

	bolt "go.etcd.io/bbolt"
)

func (s *Storage) SaveRequest(binName string, r *http.Request) (*types.RequestStruct, error) {
	req := helpers.RequestStruct(r)
	err := s.db.Update(func(tx *bolt.Tx) error {
		bucketID := []byte(binName)
		_, err := tx.CreateBucketIfNotExists(bucketID)
		if err != nil {
			return fmt.Errorf("create bucket: %s", err)
		}

		b := tx.Bucket(bucketID)

		id, err := b.NextSequence()

		if err != nil {
			return err
		}

		jsonReq, err := json.Marshal(req)

		if err != nil {
			return err
		}

		return b.Put(helpers.Itob(int(id)), jsonReq)
	})

	return req, err
}
