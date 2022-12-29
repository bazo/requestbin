package storage

import (
	"encoding/json"
	"requestbin/types"

	bolt "go.etcd.io/bbolt"
)

func (s *Storage) LoadBins() ([]*types.Bin, error) {

	var bins []*types.Bin

	err := s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("bins"))

		b.ForEach(func(k, v []byte) error {
			bin := &types.Bin{}
			json.Unmarshal(v, bin)
			bins = append(bins, bin)
			return nil
		})
		return nil
	})

	return bins, err
}
