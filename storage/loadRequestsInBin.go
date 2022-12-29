package storage

import (
	"encoding/json"
	"requestbin/types"

	bolt "go.etcd.io/bbolt"
)

func (s *Storage) LoadRequestsInBin(binName string, page int64, limit int64) ([]*types.RequestStruct, int64, error) {

	var total int64
	total = 0
	requests := make([]*types.RequestStruct, 0)
	err := s.stormDb.Bolt.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(binName))

		if b == nil {
			return nil
		}

		b.ForEach(func(k, v []byte) error {
			total++
			return nil
		})

		return nil
	})

	if err != nil {
		return requests, total, err
	}

	if err == nil {
		skip := (page - 1) * limit

		query := s.stormDb.Select().Limit(int(limit)).Skip(int(skip)).OrderBy("Time").Reverse()
		query.Bucket(binName)

		query.RawEach(func(k, v []byte) error {
			req := &types.RequestStruct{}
			json.Unmarshal(v, req)
			requests = append(requests, req)
			return nil
		})
	}

	return requests, total, err
}
